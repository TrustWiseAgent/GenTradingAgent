import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'
import { agentServer } from './server'

export interface ohlcvData {
  time: number
  open: number
  high: number
  low: number
  close: number
  vol: number
}

interface ICryptoAsset {
  base: string
  quote: string
  symbol: string
  type: string
}

interface IStockUSAsset {
  cik_str: number
  ticker: string
  title: string
}

export interface IState {
  cryptoAssets: { [assertType: string]: { [asset: string]: ICryptoAsset } }
  stockUSAssets: { [asset: string]: IStockUSAsset }
  ohlcvDB: { [asset: string]: { [interval: string]: ohlcvData[] } }
  currentAsset: string
  currentOhlcv: ohlcvData[]
  currentInterval: string
  notifyMessage: string
  serverLatency: number
}

export const keyStore: InjectionKey<Store<IState>> = Symbol()

export const store = createStore<IState>({
  state: () => ({
    cryptoAssets: {},
    stockUSAssets: {},
    ohlcvDB: { btc: { '1h': [] } },
    currentAsset: 'btc',
    currentOhlcv: [],
    currentInterval: '1h',
    notifyMessage: 'Last message',
    serverLatency: -1
  }),
  mutations: {
    updateCryptoAssetDB(state, newCryptoAssetDB) {
      console.log('updateCryptoAssetDB')
      state.cryptoAssets = newCryptoAssetDB
    },
    updateStockUSAssetDB(state, newStockUSDB) {
      console.log('updateStockUSAssetDB')
      state.stockUSAssets = newStockUSDB
    },
    updateOhlcvDB(state, newOhlcvDB) {
      console.log('updateOhlcvDB')
      console.log(newOhlcvDB)
      state.ohlcvDB = newOhlcvDB
      state.currentAsset = Object.keys(newOhlcvDB)[0]
      state.currentOhlcv = state.ohlcvDB[state.currentAsset][state.currentInterval]
    },
    updateCurrentAsset(state, newAsset: string) {
      console.log('updateCurrentAsset')
      state.currentAsset = newAsset
      if (state.currentAsset in state.ohlcvDB) {
        state.currentOhlcv = state.ohlcvDB[state.currentAsset][state.currentInterval]
      }
      //console.log(state.c)
      const callback = ((data) => {
        console.log(data)
        state.currentOhlcv = data
        console.log(state.currentOhlcv)
      })
      agentServer.get_ohlcv(newAsset, state.currentInterval, callback)
    },
    updateCurrentInterval(state, newInterval: string) {
      console.log('updateCurrentInterval')
      state.currentInterval = newInterval
      if (state.currentAsset in state.ohlcvDB) {
        state.currentOhlcv = state.ohlcvDB[state.currentAsset][state.currentInterval]
        console.log(state.currentOhlcv)
        console.log("222")
      }
      const callback = ((data) => {
        console.log(data)
        state.currentOhlcv = data
      })
      agentServer.get_ohlcv(state.currentAsset, state.currentInterval, callback)
    },
    updateNotification(state, notifyMessage) {
      state.notifyMessage = notifyMessage
    },
    updateServerConnection(state, latency) {
      state.serverLatency = latency
    }
  }
})

// define your own `useStore` composition function
export function useStore() {
  return baseUseStore(keyStore)
}

export function getMarket(state: IState, asset: string): string | null {
  if (state.cryptoAssets['spot'] != null) {
    if (asset in state.cryptoAssets['spot']) {
      return 'Crypto[Spot]'
    }
  }
  if (asset in state.stockUSAssets) {
    return 'Stock[US]'
  }

  return null
}
