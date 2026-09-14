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

  // Tích hợp phát âm chuẩn (Hỗ trợ Google Cloud TTS hoặc fallback về trình duyệt)
  const speakWord = (text, e) => {
    e.stopPropagation();
    
    // Nếu bạn sau này cấu hình Google Cloud TTS API Key, có thể fetch trực tiếp tại đây.
    // Hiện tại dùng SpeechSynthesis chuẩn tiếng Nhật (ja-JP) với tốc độ mượt mà:
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Ngắt giọng đọc cũ nếu đang đọc dở
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85; // Đọc chậm rãi, rõ ràng chuẩn tiếng Nhật
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt không hỗ trợ phát âm!");
    }
  };

  if (!role) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '20px' }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '45px 35px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(244,114,182,0.2)', textAlign: 'center', width: '100%', maxWidth: '420px' }}>
          <div style={{ width: '60px', height: '60px', background: '#ec4899', color: 'white', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 20px auto', boxShadow: '0 10px 20px rgba(236,72,153,0.3)' }}>🌸</div>
          <h2 style={{ color: '#831843', marginBottom: '8px', fontSize: '1.7rem' }}>Minna Flashcard</h2>
          <p style={{ color: '#9d174d', fontSize: '0.95rem', marginBottom: '25px' }}>Chinh phục từ vựng tiếng Nhật mỗi ngày</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input placeholder="Tên đăng nhập" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #fbcfe8', fontSize: '1rem', outline: 'none', background: '#fff1f2', color: '#831843' }} />
            <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #fbcfe8', fontSize: '1rem', outline: 'none', background: '#fff1f2', color: '#831843' }} />
            <button type="submit" style={{ padding: '14px', backgroundColor: '#db2777', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px', boxShadow: '0 8px 20px rgba(219,39,119,0.3)' }}>Đăng Nhập Ngay</button>
          </form>
        </div>
      </div>
    )
  }

  const lessonsAvailable = Object.keys(vocabData);
  const currentDeckList = vocabData[currentDeck] || [];
  const currentWord = currentDeckList[currentIndex] || null;
  const progressPercent = currentDeckList.length > 0 ? ((currentIndex + 1) / currentDeckList.length) * 100 : 0;

  const hiraganaLength = currentWord?.hiragana?.length || 0;
  const dynamicFontSize = hiraganaLength > 12 ? '2rem' : hiraganaLength > 8 ? '2.4rem' : '3.2rem';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff1f2', padding: '30px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#ffffff', padding: '35px 45px', borderRadius: '24px', boxShadow: '0 15px 35px rgba(244,114,182,0.1)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ffe4e6', paddingBottom: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', background: '#db2777', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>🌸</div>
            <h2 style={{ margin: 0, color: '#831843', fontSize: '1.6rem', fontWeight: '800' }}>Minna Flashcard</h2>
          </div>
          <button 
            onClick={() => setRole(null)} 
            style={{ backgroundColor: '#ffe4e6', color: '#e11d48', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
            Đăng xuất
          </button>
        </div>

        {/* Bảng Admin */}
        {role === 'admin' && (
          <div style={{ background: '#fff1f2', padding: '25px', borderRadius: '16px', marginBottom: '30px', border: '2px dashed #f43f5e' }}>
            <h3 style={{ marginTop: 0, color: '#881337', textAlign: 'center', marginBottom: '18px', fontSize: '1.2rem' }}>🌸 Bảng Thêm Từ Vựng Mới (Admin)</h3>
            <form onSubmit={handleAddWord} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input placeholder="Bài học (VD: Bài 26)" value={newWord.level} onChange={e => setNewWord({...newWord, level: e.target.value})} required style={{width: '130px', padding: '11px', border: '1px solid #f43f5e', borderRadius: '8px'}}/>
              <input placeholder="Hiragana" value={newWord.hiragana} onChange={e => setNewWord({...newWord, hiragana: e.target.value})} required style={{padding: '11px', border: '1px solid #f43f5e', borderRadius: '8px'}} />
              <input placeholder="Kanji" value={newWord.kanji} onChange={e => setNewWord({...newWord, kanji: e.target.value})} style={{padding: '11px', border: '1px solid #f43f5e', borderRadius: '8px'}} />
              <input placeholder="Nghĩa" value={newWord.meaning} onChange={e => setNewWord({...newWord, meaning: e.target.value})} required style={{padding: '11px', border: '1px solid #f43f5e', borderRadius: '8px'}} />
              <button type="submit" style={{ padding: '11px 24px', backgroundColor: '#e11d48', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Lưu Vào DB</button>
            </form>
          </div>
        )}

        {/* Chọn bài học */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
          <label style={{ fontWeight: '700', fontSize: '1.1rem', color: '#9d174d' }}>📚 Chọn Bài Học:</label>
          <select value={currentDeck} onChange={e => {setCurrentDeck(e.target.value); setCurrentIndex(0); setIsFlipped(false);}} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '1.05rem', border: '2px solid #fbcfe8', cursor: 'pointer', outline: 'none', backgroundColor: '#ffffff', fontWeight: '600', color: '#831843' }}>
            {lessonsAvailable.map(lesson => (
               <option key={lesson} value={lesson}>{lesson}</option>
            ))}
          </select>
        </div>

        {/* Tiến độ */}
        {currentDeckList.length > 0 && (
          <div style={{ maxWidth: '600px', margin: '0 auto 20px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: '#9d174d', marginBottom: '6px' }}>
              <span>Tiến độ bài học</span>
              <span>{currentIndex + 1} / {currentDeckList.length} từ</span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#ffe4e6', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, backgroundColor: '#db2777', height: '100%', transition: 'width 0.3s ease', borderRadius: '4px' }}></div>
            </div>
          </div>
        )}

        {/* Thẻ Flashcard */}
        {lessonsAvailable.length === 0 ? <p style={{ textAlign: 'center', color: '#888' }}>Đang tải dữ liệu từ vựng...</p> : 
          currentWord ? (
          <div 
            onClick={() => setIsFlipped(!isFlipped)} 
            style={{ 
              margin: '0 auto', 
              cursor: 'pointer', 
              width: '100%', 
              maxWidth: '650px', 
              height: '280px', 
              perspective: '1000px' 
            }}
          >
            <div style={{ 
              width: '100%', 
              height: '100%', 
              position: 'relative', 
              transformStyle: 'preserve-3d', 
              transition: 'transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)', 
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              borderRadius: '24px',
              boxShadow: '0 15px 30px rgba(244,114,182,0.15)'
            }}>
              
              {/* Mặt trước */}
              <div style={{ 
                position: 'absolute', 
                width: '100%', 
                height: '100%', 
                backfaceVisibility: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                backgroundColor: '#ffffff', 
                borderRadius: '24px', 
                border: '2px solid #fbcfe8', 
                padding: '20px 30px',
                boxSizing: 'border-box'
              }}>
                <span style={{ position: 'absolute', top: '16px', left: '20px', fontSize: '0.75rem', fontWeight: 'bold', color: '#db2777', background: '#ffe4e6', padding: '4px 10px', borderRadius: '6px' }}>Mặt Trước (Hiragana)</span>
                
                <button 
                  onClick={(e) => speakWord(currentWord.hiragana, e)}
                  style={{ position: 'absolute', top: '14px', right: '16px', background: '#fff1f2', border: '1px solid #fbcfe8', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
                  title="Nghe phát âm"
                >
                  🔊
                </button>

                <h1 style={{ 
                  fontSize: dynamicFontSize, 
                  margin: '15px 0 0 0', 
                  color: '#831843', 
                  fontFamily: '"Meiryo", "Hiragino Sans", "MS PGothic", sans-serif',
                  letterSpacing: '2px',
                  lineHeight: '1.4',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  maxWidth: '100%'
                }}>
                  {currentWord.hiragana}
                </h1>
                <span style={{ color: '#f43f5e', fontSize: '0.85rem', marginTop: '15px' }}>Bấm vào thẻ để lật mặt sau ⟳</span>
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
                backgroundColor: '#fff5f7', 
                borderRadius: '24px', 
                border: '2px solid #f472b6', 
                transform: 'rotateY(180deg)',
                padding: '20px 30px',
                boxSizing: 'border-box'
              }}>
                <span style={{ position: 'absolute', top: '16px', left: '20px', fontSize: '0.75rem', fontWeight: 'bold', color: '#be185d', background: '#fbcfe8', padding: '4px 10px', borderRadius: '6px' }}>Mặt Sau (Kanji & Nghĩa)</span>
                
                <h2 style={{ 
                  fontSize: dynamicFontSize, 
                  margin: '10px 0 8px 0', 
                  color: '#831843',
                  fontFamily: '"Meiryo", "Hiragino Sans", "MS PGothic", sans-serif',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  maxWidth: '100%'
                }}>
                  {currentWord.kanji || currentWord.hiragana}
                </h2>
                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px 0', color: '#be185d', fontWeight: '700', textAlign: 'center' }}>
                  {currentWord.meaning}
                </h3>
                <span style={{ color: '#f43f5e', fontSize: '0.85rem' }}>Bấm vào thẻ để lật về mặt trước ⟳</span>
              </div>

            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9d174d' }}>
            <p style={{ fontSize: '1.1rem' }}>🌸 Bài học này hiện chưa có từ vựng nào.</p>
          </div>
        )}
        
        {/* Nút điều hướng */}
        {currentWord && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '35px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {setIsFlipped(false); setCurrentIndex((prev) => (prev === 0 ? currentDeckList.length - 1 : prev - 1))}} 
              style={{ fontSize: '1rem', padding: '13px 24px', backgroundColor: '#fb7185', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(251,113,133,0.3)' }}
            >
              ⬅ Từ trước
            </button>

            <button 
              onClick={() => {setIsFlipped(false); setCurrentIndex((prev) => (prev + 1) % currentDeckList.length)}} 
              style={{ fontSize: '1rem', padding: '13px 28px', backgroundColor: '#db2777', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(219,39,119,0.3)' }}
            >
              Từ tiếp theo ➔
            </button>

            {role === 'admin' && (
              <button 
                onClick={() => handleDeleteWord(currentWord.id)}
                style={{ fontSize: '1rem', padding: '13px 20px', backgroundColor: '#e11d48', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(225,29,72,0.3)' }}
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