defmodule SignEth.Repo do
  use Ecto.Repo,
    otp_app: :sign_eth,
    adapter: Ecto.Adapters.Postgres
end
