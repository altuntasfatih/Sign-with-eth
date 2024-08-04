defmodule SignEthWeb.SignMessage do
  use SignEthWeb, :live_view

  @default_message "Sign this message to verify you have access to the wallet."
  def mount(_params, _session, socket) do
    socket =
      assign(socket, :address, nil)
      |> assign(:message, @default_message)

    {:ok, socket}
  end

  def render(assigns) do
    ~H"""
    <div>
      <div>
        <.label>
          <.input name="message" value={@message} type="textarea" />
        </.label>
      </div>
      <div class="mt-6 flex items-center justify-end gap-x-6">
        <.button
          phx-click="sign-message"
          class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Sign
        </.button>
      </div>
    </div>
    """
  end

  def handle_event("sign-message", _params, socket) do
    IO.inspect("hello")

    {:noreply,
     push_event(socket, "web3-connect:sign-message-client", %{message: socket.assigns.message})}
  end
end
