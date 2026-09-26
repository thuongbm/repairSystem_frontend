import { useState, useEffect } from 'react'

function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // URL này chính là cái bạn vừa test thành công trên Swagger
    fetch('http://localhost:5107/WeatherForecast')
      .then(response => {
        if (!response.ok) {
          throw new Error('Lỗi mạng hoặc lỗi server')
        }
        return response.json()
      })
      .then(data => setData(data))
      .catch(error => setError(error.message))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Kết nối React & .NET Backend 🎉</h1>
      
      {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
      
      {!data && !error && <p>Đang tải dữ liệu từ Backend...</p>}

      {data && (
        <div>
          <p>Lấy dữ liệu thành công! Dưới đây là kết quả:</p>
          <pre style={{ 
            background: '#f4f4f4', 
            padding: '10px', 
            borderRadius: '5px' 
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default App