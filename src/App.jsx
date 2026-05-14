import { useState, useEffect } from 'react'
import { searchDictionary, initializeData } from './data/parser'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState({ qieyun: [], shanggu: [] })
  const [isLoading, setIsLoading] = useState(true)

  // 初始化数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await initializeData()
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setResults({ qieyun: [], shanggu: [] })
      return
    }

    const filteredResults = searchDictionary(searchTerm)
    setResults(filteredResults)
  }

  const handleRandom = () => {
    // Unicode汉字各区域范围
    const ranges = [
      { start: 19968, end: 40959 },   // 基本区: U+4E00-U+9FFF
      { start: 13312, end: 19903 },   // 扩展A区: U+3400-U+4DBF
      { start: 131072, end: 173791 }, // 扩展B区: U+20000-U+2A6DF
      { start: 173824, end: 177983 }, // 扩展C区: U+2A700-U+2B73F
      { start: 177984, end: 178207 }, // 扩展D区: U+2B740-U+2B81F
      { start: 178208, end: 183983 }, // 扩展E区: U+2B820-U+2CEAF
      { start: 183984, end: 191471 }, // 扩展F区: U+2CEB0-U+2EBEF
      { start: 196608, end: 201551 }, // 扩展G区: U+30000-U+3134F
      { start: 201552, end: 205743 }, // 扩展H区: U+31350-U+323AF
      { start: 191472, end: 192095 }, // 扩展I区: U+2EBF0-U+2EE5F
      { start: 205744, end: 205823 }, // 扩展J区: U+323B0-U+323FF
    ];
    
    // 计算总码点数
    let total = 0;
    ranges.forEach(range => {
      total += range.end - range.start + 1;
    });
    
    // 使用密码学安全的伪随机数生成器
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomOffset = array[0] % total;
    
    // 找到对应的范围并计算具体码点
    let currentOffset = 0;
    let randomCodePoint = 0;
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      const rangeSize = range.end - range.start + 1;
      if (currentOffset + rangeSize > randomOffset) {
        randomCodePoint = range.start + (randomOffset - currentOffset);
        break;
      }
      currentOffset += rangeSize;
    }
    
    const randomChar = String.fromCodePoint(randomCodePoint);
    
    // 设置搜索词并执行搜索
    setSearchTerm(randomChar);
    const filteredResults = searchDictionary(randomChar);
    setResults(filteredResults);
  }

  const hasResults = results.qieyun.length > 0 || results.shanggu.length > 0;
  const hasQieyun = results.qieyun.length > 0;
  const hasShanggu = results.shanggu.length > 0;

  return (
    <>
      <div className="donation-buttons">
        <div className="alipay-donation">
          <button className="donation-button">支付寶打賞</button>
          <div className="donation-image">
            <img src="/qieyun/IMG_0287.JPG" alt="支付寶打賞" />
          </div>
        </div>
        <div className="wechat-donation">
          <button className="donation-button">微信打賞</button>
          <div className="donation-image">
            <img src="/qieyun/IMG_0661.JPG" alt="微信打賞" />
          </div>
        </div>
      </div>
      <section id="center">
        <div className="hero">
          <h1>切韵擬音查詢</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="輸入漢字..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="search-input"
            />
            <button
              className="search-button"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? '加载中...' : '搜索'}
            </button>
            <button
              className="random-button"
              onClick={handleRandom}
              disabled={isLoading}
            >
              {isLoading ? '加载中...' : '隨緣'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading">
            <p>正在加载数据...</p>
          </div>
        ) : hasResults ? (
          <div className="results-container">
            <h2>搜索結果</h2>
            <ul className="results-list">
              {hasQieyun && (() => {
                const sourceCounts = {};
                return results.qieyun.map((item, index) => {
                  if (!sourceCounts[item.source]) {
                    sourceCounts[item.source] = 0;
                  }
                  sourceCounts[item.source]++;
                  return (
                    <li key={`qieyun-${index}`} className="result-item">
                      <span className="result-number">{sourceCounts[item.source]}. </span>
                      <span className="word">{item.word} </span>
                      <span className="source">{item.source}</span>
                      <span className="definition" dangerouslySetInnerHTML={{ __html: item.definition }}></span>
                    </li>
                  );
                });
              })()}
            </ul>

            {hasShanggu && (
              <>
                <div className="results-divider">
                  <span>以上为切韵音</span>
                  <span className="divider-line"></span>
                  <span>以下为上古音</span>
                </div>
                <ul className="results-list">
                  {(() => {
                    const sourceCounts = {};
                    let firstChanghetuIndex = -1;
                    results.shanggu.forEach((item, index) => {
                      if (item.source === '聲音唱和圖' && firstChanghetuIndex === -1) {
                        firstChanghetuIndex = index;
                      }
                    });
                    return results.shanggu.map((item, index) => {
                      if (!sourceCounts[item.source]) {
                        sourceCounts[item.source] = 0;
                      }
                      sourceCounts[item.source]++;
                      const showDivider = index === firstChanghetuIndex && firstChanghetuIndex !== -1;
                      return (
                        <>
                          {showDivider && (
                            <li key={`changhetu-divider-${index}`} className="inner-divider">
                              <span className="divider-line"></span>
                            </li>
                          )}
                          <li key={`shanggu-${index}`} className="result-item">
                            <span className="result-number">{sourceCounts[item.source]}. </span>
                            <span className="word">{item.word} </span>
                            <span className="source">{item.source}</span>
                            <span className="definition" dangerouslySetInnerHTML={{ __html: item.definition }}></span>
                          </li>
                        </>
                      );
                    });
                  })()}
                </ul>
              </>
            )}
          </div>
        ) : hasResults === false && searchTerm ? (
          <div className="no-results">
            <p>未找到匹配的結果</p>
          </div>
        ) : null}
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
      <footer className="footer">
        <p>© 2025-2026 楊力 版權所有 | <a href="mailto:angelo_yang@outlook.com">聯繫我</a></p>
      </footer>
    </>
  )
}

export default App