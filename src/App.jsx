import { useState, useEffect } from 'react'
import { searchDictionary, initializeData } from './data/parser'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState([])
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
      setResults([])
      return
    }

    const filteredResults = searchDictionary(searchTerm)
    setResults(filteredResults)
  }

  return (
    <>
      <div className="donation-buttons">
        <div className="alipay-donation">
          <button className="donation-button">支付寶打賞</button>
          <div className="donation-image">
            <img src="/IMG_0287.JPG" alt="支付寶打賞" />
          </div>
        </div>
        <div className="wechat-donation">
          <button className="donation-button">微信打賞</button>
          <div className="donation-image">
            <img src="/IMG_0661.JPG" alt="微信打賞" />
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
          </div>
        </div>

        {isLoading ? (
          <div className="loading">
            <p>正在加载数据...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="results-container">
            <h2>搜索結果</h2>
            <ul className="results-list">
              {(() => {
                const sourceCounts = {};
                return results.map((item, index) => {
                  if (!sourceCounts[item.source]) {
                    sourceCounts[item.source] = 0;
                  }
                  sourceCounts[item.source]++;
                  return (
                    <li key={index} className="result-item">
                      <span className="result-number">{sourceCounts[item.source]}. </span>
                      <span className="word">{item.word} </span>
                      <span className="source">{item.source}</span>
                      <span className="definition" dangerouslySetInnerHTML={{ __html: item.definition }}></span>
                    </li>
                  );
                });
              })()}
            </ul>
          </div>
        ) : results.length === 0 && searchTerm ? (
          <div className="no-results">
            <p>未找到匹配的切韵</p>
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
