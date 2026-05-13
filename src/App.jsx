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
    const codePoints = [];
    
    // Unicode汉字基本区: U+4E00 (19968) 到 U+9FFF (40959)
    for (let i = 19968; i <= 40959; i++) {
      codePoints.push(i);
    }
    
    // Unicode汉字扩展A区: U+3400 (13312) 到 U+4DBF (19903)
    for (let i = 13312; i <= 19903; i++) {
      codePoints.push(i);
    }
    
    // 使用密码学安全的伪随机数生成器
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomIndex = array[0] % codePoints.length;
    const randomCodePoint = codePoints[randomIndex];
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