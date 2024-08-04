
let Web3Connect = {
  connection: null,
  web3Provider: null,
  async mounted() {
    await this.lazyLoadWeb3Resources();

    window.addEventListener("phx:web3-connect:open-redirect", (event) => {
      const url = event.target.dataset.url;
      console.log(event)
    });

    this.handleEvent("web3-connect:connect-provider-client", (e) => {
      this.liveSocket.execJS(this.el, this.el.dataset.hideSnackbarInstant);
      this.handleConnectWeb3Provider(e);
    });

    this.handleEvent(
      "web3-connect:sign-message-client",
      async ({ message }) => {
        console.log("sign a message")

        console.log(message)
        await this.signMessage(message);
      }
    );
    this.handleEvent("web3-connect:error", (e) => this.handleConnectError(e));
    this.handleEvent("web3-connect:disconnect-wallet", () => {
      this.disconnectWallet();
    });
    this.handleEvent("web3-connect:close-modal", (_e) => {
      this.liveSocket.execJS(this.el, this.el.dataset.showSnackbar);
      document
        .querySelectorAll(".web3-connect-button")
        .forEach((el) => el.classList.add("hidden"));
      setTimeout(() => {
        document
          .querySelector("#web3-connect-modal")
          .dispatchEvent(new CustomEvent("moonds:drawer:close"));
      }, 2000);

      setTimeout(() => {
        this.liveSocket.execJS(this.el, this.el.dataset.hideSnackbar);
      }, 2000);
    });
  },
  async lazyLoadWeb3Resources() {
    const { web3Provider } = await import("../../web3");
    this.web3Provider = web3Provider;
    await this.reconnectIfConnectionExists();
    this.loadProviders();
  },
  loadProviders() {
    this.pushEventTo(this.el, "web3-connect:detected-providers", {
      providers: this.getWeb3WalletExtensions(),
    });
  },
  async reconnected() {
    await this.reconnectIfConnectionExists();
  },
  async connectWallet(provider) {
    try {
      this.connection = await this.web3Provider.connect(provider);
    } catch (error) {
      this.sendErrorEvent(error);
    } finally {
      if (this.connection) {
        setTimeout(() => this.sendSignMessageEvent(provider), 3000);
      }
    }
  },
  async signMessage(message) {
    try {
      const signature = await this.web3Provider.signMessage({
        message,
        account: this.connection.accounts[0],
        connector: this.connection.connector,
      });
      this.pushEventTo(this.el, "web3-connect:signed-message", {
        signature: signature,
        address: this.connection.accounts[0],
      });
    } catch (error) {
      this.sendErrorEvent(error);
    }
  },
  findProvider(providerId) {
    return this.web3Provider
      .getConnectors()
      .find(({ id }) => id === providerId);
  },
  async handleConnectWeb3Provider(event) {
    const { provider: providerId } = event;
    this.connection = this.getExistingConnection(providerId);
    let provider = this.findProvider(providerId);
    // If user somehow clicks on provider that we didn't detect
    if (!provider) {
      this.pushEventTo(this.el, "web3-connect:injected-provider-not-detected", {
        provider: providerId,
      });
      return;
    }

    if (this.connection) {
      this.sendSignMessageEvent(provider);
    } else {
      await this.connectWallet(provider);
    }
  },
  sendSignMessageEvent(provider) {
    this.pushEventTo(this.el, "web3-connect:sign-message", {
      provider: {
        id: provider.id,
        address: this.connection.accounts[0],
        is_connected: true,
      },
    });
  },
  handleConnectError(e) {
    this.liveSocket.execJS(this.el, this.el.dataset.showSnackbar);

    setTimeout(() => {
      this.liveSocket.execJS(this.el, this.el.dataset.hideSnackbar);
    }, 1200);
    console.error("connect error received:", e);
  },
  disconnectWallet() {
    if (!this.connection) return;
    this.web3Provider.disconnect();
    this.connection = null;
  },
  sendErrorEvent(error) {
    this.pushEventTo(this.el, "web3-connect:connection-error", { error });
  },
  providersUpdated(provider) {
    this.pushEventTo(this.el, "web3-connect:providers-updated", {
      providers: [
        {
          id: provider.id,
          address: this.connection.accounts[0],
          is_connected: true,
        },
      ],
    });
  },
  async reconnectIfConnectionExists() {
    if (this.activeWeb3Connections()) {
      await this.web3Provider.reconnect();
    }
  },
  activeWeb3Connections() {
    return this.getweb3Connections().length !== 0;
  },
  getExistingConnection(providerId) {
    const connections = this.getweb3Connections();
    if (!connections.length) return null;

    return connections.find((conn) => {
      return conn.connector.id === providerId;
    });
  },
  getWeb3WalletExtensions() {
    return this.web3Provider.getConnectors().map(({ id, name, type }) => {
      return { id, name, injected: type === "injected" };
    });
  },
  getweb3Connections() {
    return this.web3Provider.getConnections();
  },
};

export default Web3Connect;
