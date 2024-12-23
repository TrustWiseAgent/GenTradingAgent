//
// Manage the local cache data
//
import { readFileSync } from 'fs'
import { join } from 'path'
import { parse } from 'csv-parse'
interface ohlcvData {
  time: number | string
  open: number | string
  high: number | string
  low: number | string
  close: number | string
  vol: number | string
}
export class LocalStore {
  private rootDir: string
  private cryptoAssets: object | null = null
  private stockUSAssets: object | null = null
  private ohlcDB: { [assetName: string]: { [timeFrame: string]: ohlcvData[] } } = {}
  public constructor(cacheDir: string) {
    this.rootDir = cacheDir
  }

  private loadJsonData(filePath: string): object {
    const data = readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  }

  private loadCsvData(filePath: string, dataArray: ohlcvData[]): void {
    const data = readFileSync(filePath, { encoding: 'utf-8' })
    const headers = ['time', 'open', 'high', 'low', 'close', 'vol']
    parse(
      data,
      {
        delimiter: ',',
        columns: headers
      },
      (error, result: ohlcvData[]) => {
        if (error) {
          console.error(error)
        }
        result.shift()

        result.forEach((element) => {
          if (typeof element.time === 'string') {
            element.time = parseInt(element.time, 10)
          }
          if (typeof element.open === 'string') {
            element.open = parseInt(element.open, 10)
          }
          if (typeof element.high === 'string') {
            element.high = parseInt(element.high, 10)
          }
          if (typeof element.low === 'string') {
            element.low = parseInt(element.low, 10)
          }
          if (typeof element.close === 'string') {
            element.close = parseInt(element.close, 10)
          }
          if (typeof element.vol === 'string') {
            element.vol = parseInt(element.vol, 10)
          }
        })
        dataArray.push(...result)
      }
    )
  }

  public init(): boolean {
    this.cryptoAssets = this.loadJsonData(join(this.rootDir, 'Binance/crypto_assets.json'))
    this.stockUSAssets = this.loadJsonData(join(this.rootDir, 'StockUS/stock_us_ticker.json'))
    const arr = ['btc', 'msft']
    arr.forEach((item: string) => {
      this.ohlcDB[item] = {
        '1h': [],
        '1d': [],
        '1w': [],
        '1M': []
      }
    })
    this.loadCsvData(join(this.rootDir, 'Binance/btc_usdt-1hour.csv'), this.ohlcDB['btc']['1h'])
    this.loadCsvData(join(this.rootDir, 'Binance/btc_usdt-1mon.csv'), this.ohlcDB['btc']['1M'])
    this.loadCsvData(join(this.rootDir, 'Binance/btc_usdt-1day.csv'), this.ohlcDB['btc']['1d'])
    this.loadCsvData(join(this.rootDir, 'Binance/btc_usdt-1week.csv'), this.ohlcDB['btc']['1w'])

    this.loadCsvData(join(this.rootDir, 'StockUS/msft-1hour.csv'), this.ohlcDB['msft']['1h'])
    this.loadCsvData(join(this.rootDir, 'StockUS/msft-1mon.csv'), this.ohlcDB['msft']['1M'])
    this.loadCsvData(join(this.rootDir, 'StockUS/msft-1day.csv'), this.ohlcDB['msft']['1d'])
    this.loadCsvData(join(this.rootDir, 'StockUS/msft-1week.csv'), this.ohlcDB['msft']['1w'])
    return true
  }

  public getCryptoAssets(): object | null {
    return this.cryptoAssets
  }

  public getStockUSAssets(): object | null {
    return this.stockUSAssets
  }

  public getOhlcvDB(): { [assetName: string]: { [timeFrame: string]: ohlcvData[] } } {
    return this.ohlcDB
  }
}
