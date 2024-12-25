import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'

export interface ohlcvData {
  time: number
  open: number
  high: number
  low: number
  close: number
  vol: number
}

export interface State {
  ohlcvDB: { [asset: string]: { [interval: string]: ohlcvData[] } }
  currentAsset: string
  currentOhlcv: ohlcvData[]
  currentInterval: string
}

export const keyStore: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: () => ({
    ohlcvDB: { btc: { '1h': [] } },
    currentAsset: 'btc',
    currentOhlcv: [],
    currentInterval: '1h'
  }),
  mutations: {
    updateOhlcvDB(state, newOhlcvDB) {
      console.log('updateOhlcvDB')
      state.ohlcvDB = newOhlcvDB
      state.currentAsset = Object.keys(newOhlcvDB)[0]
      state.currentOhlcv = state.ohlcvDB[state.currentAsset][state.currentInterval]
    },
    updateCurrentAsset(state, newAsset: string) {
      console.log('updateCurrentAsset')
      state.currentAsset = newAsset
      state.currentOhlcv = state.ohlcvDB[state.currentAsset][state.currentInterval]
    },
    updateCurrentInterval(state, newInterval: string) {
      console.log('updateCurrentInterval')
      state.currentInterval = newInterval
      state.currentOhlcv = state.ohlcvDB[state.currentAsset][state.currentInterval]
    }
  }
})

// define your own `useStore` composition function
export function useStore() {
  return baseUseStore(keyStore)
}