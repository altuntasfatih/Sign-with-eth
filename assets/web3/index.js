import { walletConnect } from "@wagmi/connectors";
import { mainnet } from "@wagmi/core/chains";
import {
  createConfig,
  fallback,
  http,
  disconnect,
  reconnect,
  connect,
  signMessage,
  getConnections,
  getConnectors,
  getEnsName,
} from "@wagmi/core";

const PROJECT_ID = "ac5de1d82bd664e7732ed400bce7395c";
const HTTP_TRANSPORT_URL =
  "https://mainnet.infura.io/v3/31fe8263fa444d90819944df74bb5b01";

const walletConnectOpts = {
  projectId: PROJECT_ID,
  qrModalOptions: { themeVariables: { "--wcm-z-index": 99 } },
};

export const coinbaseWalletOpts = {
  appName: window.__WEB3_CONNECT_APP_NAME__ || "WEB3_CONNECT",
};

const connectors = [walletConnect(walletConnectOpts)];

class Web3ConnectionProvider {
  constructor() {
    this.config = null;
  }
  init() {
    this.config = createConfig({
      chains: [mainnet],
      connectors,
      transports: {
        [mainnet.id]: fallback([http(HTTP_TRANSPORT_URL), http()]),
      },
    });
  }

  async connect(provider) {
    this.#checkNullableConfig();
    return await connect(this.config, { connector: provider });
  }

  async signMessage({ message, account, connector }) {
    this.#checkNullableConfig();
    return await signMessage(this.config, {
      message,
      account,
      connector,
    });
  }

  disconnect() {
    this.#checkNullableConfig();
    return disconnect(this.config);
  }

  async reconnect() {
    this.#checkNullableConfig();
    return await reconnect(this.config);
  }

  getConnections() {
    this.#checkNullableConfig();
    return getConnections(this.config);
  }

  getConnectors() {
    this.#checkNullableConfig();
    return getConnectors(this.config);
  }

  async getEnsName(address) {
    this.#checkNullableConfig();
    return await getEnsName(this.config, { address });
  }

  #checkNullableConfig() {
    assert(this.config, "config is null");
  }
}

const assert = (condition, errorMsg) => {
  if (!condition) {
    throw new Error(errorMsg);
  }
};

const web3ConnectionProvider = () => {
  const provider = new Web3ConnectionProvider();
  provider.init();

  return provider;
};

export const web3Provider = web3ConnectionProvider();
