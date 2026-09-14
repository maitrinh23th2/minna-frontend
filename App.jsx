import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [role, setRole] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [vocabData, setVocabData] = useState({})
  const [currentDeck, setCurrentDeck] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const [newWord, setNewWord] = useState({ kanji: '', hiragana: '', meaning: '', level: 'Bài 26' })

  const fetchVocab = () => {
    fetch('https://minna-backend.onrender.com/api/vocab')
      .then(res => res.json())
      .then(data => {
        setVocabData(data)
        const lessons = Object.keys(data);
        if (lessons.length > 0 && !currentDeck) {
          setCurrentDeck(lessons[0]);
        }
      })
      .catch(err => console.error("Lỗi:", err))
  }

  useEffect(() => { fetchVocab() }, [])

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('https://minna-backend.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.role) setRole(data.role);
      else alert("Đăng nhập thất bại!");
    })
  }

  const handleAddWord = (e) => {
    e.preventDefault();
    fetch('https://minna-backend.onrender.com/api/vocab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWord)
    })
    .then(res => res.json())
    .then(() => {
      setNewWord({ kanji: '', hiragana: '', meaning: '', level: newWord.level });
      fetchVocab(); 
    })
  }

  const handleDeleteWord = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa từ vựng này khỏi Database không?")) return;

    fetch(`https://minna-backend.onrender.com/api/vocab/${id}`, {
      method: 'DELETE',
    })
    .then(res => res.json())
    .then(() => {
      setIsFlipped(false);
      setCurrentIndex(0);
      fetchVocab();
    })
    .catch(err => console.error("Lỗi xóa từ:", err));
  }

  if (!role) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Hệ Thống Từ Vựng</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input placeholder="Tên đăng nhập" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} />
            <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} />
            <button type="submit" style={{ padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px' }}>Vào Học</button>
          </form>
        </div>
      </div>
    )
  }

  const lessonsAvailable = Object.keys(vocabData);
  const currentWord = vocabData[currentDeck] ? vocabData[currentDeck][currentIndex] : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', padding: '30px 40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f4f8', paddingBottom: '20px', marginBottom: '30px' }}>
          <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.8rem' }}>Minna no Nihongo Flashcard</h2>
          <button 
            onClick={() => setRole(null)} 
            style={{ backgroundColor: '#ffe3e3', color: '#dc3545', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Đăng xuất
          </button>
        </div>

        {role === 'admin' && (
          <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '35px', border: '1px dashed #ced4da' }}>
            <h3 style={{ marginTop: 0, color: '#495057', textAlign: 'center', marginBottom: '20px' }}>🔧 Bảng Thêm Từ Vựng</h3>
            <form onSubmit={handleAddWord} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input placeholder="Bài học (VD: Bài 26)" value={newWord.level} onChange={e => setNewWord({...newWord, level: e.target.value})} required style={{width: '130px', padding: '10px', border: '1px solid #ccc', borderRadius: '6px'}}/>
              <input placeholder="Hiragana (VD: みます)" value={newWord.hiragana} onChange={e => setNewWord({...newWord, hiragana: e.target.value})} required style={{padding: '10px', border: '1px solid #ccc', borderRadius: '6px'}} />
              <input placeholder="Kanji (VD: 見ます)" value={newWord.kanji} onChange={e => setNewWord({...newWord, kanji: e.target.value})} style={{padding: '10px', border: '1px solid #ccc', borderRadius: '6px'}} />
              <input placeholder="Nghĩa (VD: Xem)" value={newWord.meaning} onChange={e => setNewWord({...newWord, meaning: e.target.value})} required style={{padding: '10px', border: '1px solid #ccc', borderRadius: '6px'}} />
              <button type="submit" style={{ padding: '10px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Lưu Từ</button>
            </form>
          </div>
        )}

        <div className="menu-container" style={{ marginBottom: '35px', textAlign: 'center' }}>
          <label style={{ marginRight: '15px', fontWeight: 'bold', fontSize: '1.2rem', color: '#555' }}>Chọn Bài Học: </label>
          <select value={currentDeck} onChange={e => {setCurrentDeck(e.target.value); setCurrentIndex(0); setIsFlipped(false);}} style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '1.1rem', border: '2px solid #e2e8f0', cursor: 'pointer', outline: 'none', backgroundColor: '#f8fafc' }}>
            {lessonsAvailable.map(lesson => (
               <option key={lesson} value={lesson}>{lesson}</option>
            ))}
          </select>
        </div>

        {lessonsAvailable.length === 0 ? <p style={{ textAlign: 'center', color: '#888' }}>Đang tải dữ liệu...</p> : 
          currentWord ? (
          <div 
            onClick={() => setIsFlipped(!isFlipped)} 
            style={{ 
              margin: '0 auto', 
              cursor: 'pointer', 
              width: '100%', 
              maxWidth: '450px', 
              height: '260px', 
              perspective: '1000px' 
            }}
          >
            <div style={{ 
              width: '100%', 
              height: '100%', 
              position: 'relative', 
              transformStyle: 'preserve-3d', 
              transition: 'transform 0.4s ease', 
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
            }}>
              
              {/* Mặt trước */}
              <div style={{ 
                position: 'absolute', 
                width: '100%', 
                height: '100%', 
                backfaceVisibility: 'hidden', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                backgroundColor: '#ffffff', 
                borderRadius: '20px', 
                border: '2px solid #007bff', 
                boxShadow: '0 8px 16px rgba(0,123,255,0.15)',
                padding: '20px',
                boxSizing: 'border-box'
              }}>
                <h1 style={{ 
                  fontSize: '3.8rem', 
                  margin: 0, 
                  color: '#0056b3', 
                  fontFamily: '"Meiryo", "Hiragino Sans", "MS PGothic", sans-serif',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  wordBreak: 'break-word'
                }}>
                  {currentWord.hiragana}
                </h1>
              </div>

              {/* Mặt sau */}
              <div style={{ 
                position: 'absolute', 
                width: '100%', 
                height: '100%', 
                backfaceVisibility: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                backgroundColor: '#fdfdfd', 
                borderRadius: '20px', 
                border: '2px solid #28a745', 
                boxShadow: '0 8px 16px rgba(40,167,69,0.15)',
                transform: 'rotateY(180deg)',
                padding: '20px',
                boxSizing: 'border-box'
              }}>
                <h2 style={{ 
                  fontSize: '3.2rem', 
                  margin: '0 0 10px 0', 
                  color: '#333333',
                  fontFamily: '"Meiryo", "Hiragino Sans", "MS PGothic", sans-serif',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  wordBreak: 'break-word'
                }}>
                  {currentWord.kanji || currentWord.hiragana}
                </h2>
                <h3 style={{ fontSize: '1.6rem', margin: 0, color: '#c92a2a', fontWeight: 'bold', textAlign: 'center' }}>
                  {currentWord.meaning}
                </h3>
              </div>

            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#888' }}>Bài học này hiện chưa có từ vựng.</p>
        )}
        
        {currentWord && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {setIsFlipped(false); setCurrentIndex((prev) => (prev + 1) % vocabData[currentDeck].length)}} 
              style={{ fontSize: '1.2rem', padding: '14px 40px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(40,167,69,0.3)', transition: 'all 0.2s' }}
            >
              Từ tiếp theo ➔
            </button>

            {role === 'admin' && (
              <button 
                onClick={() => handleDeleteWord(currentWord.id)}
                style={{ fontSize: '1.1rem', padding: '14px 25px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(220,53,69,0.3)', transition: 'all 0.2s' }}
              >
                🗑 Xóa từ này
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default App