defmodule SignEthWeb.SignMessage do
  use SignEthWeb, :live_view

  @metamask_provider_id "io.metamask"
  @default_message "Sign this message to verify you"
  def mount(_params, _session, socket) do
    socket =
      assign(socket, :address, nil)
      |> assign(:provider, nil)
      |> assign(:message, @default_message)
      |> assign(:signature, nil)

    {:ok, socket}
  end

  def render(assigns) do
    ~H"""
    <div id="web3-connect-container" phx-hook="Web3Connect">
      <div :if={@address != nil}>
        <.label>
          Wallet address: <%= @address %>
        </.label>
      </div>
      <div>
        <.label>
          <.input name="message" value={@message} type="textarea" />
        </.label>
      </div>
      <div class="mt-6 flex items-center justify-end gap-x-6">
        <.button
          :if={@provider == nil}
          phx-click="connect-metamask"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Connect Metamask
        </.button>

        <.button
          :if={@provider != nil}
          phx-click="sign-message"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Sign
        </.button>
      </div>

      <div class="flex justify-center items-center">
        <div :if={@signature != nil}>
          <.label>
            Signature: <%= @signature %>
          </.label>
        </div>
      </div>
    </div>
    """
  end

  def handle_event("sign-message", _params, socket) do
    {:noreply,
     push_event(socket, "web3-connect:sign-message", %{message: socket.assigns.message})}
  end

  def handle_event("connect-metamask", _params, socket) do
    {:noreply,
     push_event(socket, "web3-connect:select-provider", %{
       provider: @metamask_provider_id
     })}
  end

  def handle_event(
        "web3-connect:signed-message",
        %{"address" => _, "signature" => signature},
        socket
      ) do
    {:noreply, assign(socket, :signature, signature)}
  end

  def handle_event(
        "web3-connect:connected",
        %{"provider" => %{"address" => address, "id" => provider_id, "is_connected" => true}},
        socket
      ) do
    socket =
      socket
      |> assign(:address, address)
      |> assign(:provider, provider_id)

    {:noreply, socket}
  end

  def handle_event("web3-connect:detected-providers", _, socket) do
    {:noreply, socket}
  end
end
