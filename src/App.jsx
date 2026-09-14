import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [role, setRole] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [vocabData, setVocabData] = useState({})
  const [currentDeck, setCurrentDeck] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  // Tính năng mới: Đánh dấu từ đã nhớ & Chế độ Tự động chạy (Auto-play)
  const [masteredWords, setMasteredWords] = useState({})
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const autoPlayRef = useRef(null)

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

  const speakWord = (text, e) => {
    if (e) e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const currentDeckList = vocabData[currentDeck] || [];
  const currentWord = currentDeckList[currentIndex] || null;

  // Xử lý chế độ Tự động học (Auto-Play Slideshow)
  useEffect(() => {
    if (isAutoPlay && currentWord) {
      autoPlayRef.current = setTimeout(() => {
        speakWord(currentWord.hiragana);
        setTimeout(() => {
          setIsFlipped(true); // Lật sang mặt sau
          setTimeout(() => {
            setIsFlipped(false); // Lật về mặt trước và chuyển từ tiếp theo
            if (currentIndex < currentDeckList.length - 1) {
              setCurrentIndex(prev => prev + 1);
            } else {
              setIsAutoPlay(false); // Dừng khi hết bài
              setShowCelebration(true);
            }
          }, 2500);
        }, 1500);
      }, 1000);
    }
    return () => clearTimeout(autoPlayRef.current);
  }, [isAutoPlay, currentIndex, currentDeckList]);

  const toggleMastered = (wordId, e) => {
    e.stopPropagation();
    setMasteredWords(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }));
  };

  if (!role) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '20px' }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '45px 35px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(56,189,248,0.15)', textAlign: 'center', width: '100%', maxWidth: '420px' }}>
          <div style={{ width: '60px', height: '60px', background: '#0284c7', color: 'white', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 20px auto', boxShadow: '0 10px 20px rgba(2,132,199,0.25)' }}>🌊</div>
          <h2 style={{ color: '#0369a1', marginBottom: '8px', fontSize: '1.7rem' }}>Minna Flashcard</h2>
          <p style={{ color: '#0284c7', fontSize: '0.95rem', marginBottom: '25px' }}>Chinh phục từ vựng tiếng Nhật mỗi ngày</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input placeholder="Tên đăng nhập" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #bae6fd', fontSize: '1rem', outline: 'none', background: '#f0f9ff', color: '#0369a1' }} />
            <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #bae6fd', fontSize: '1rem', outline: 'none', background: '#f0f9ff', color: '#0369a1' }} />
            <button type="submit" style={{ padding: '14px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px', boxShadow: '0 8px 20px rgba(2,132,199,0.3)' }}>Đăng Nhập Ngay</button>
          </form>
        </div>
      </div>
    )
  }

  const lessonsAvailable = Object.keys(vocabData);
  const progressPercent = currentDeckList.length > 0 ? ((currentIndex + 1) / currentDeckList.length) * 100 : 0;
  const hiraganaLength = currentWord?.hiragana?.length || 0;
  const dynamicFontSize = hiraganaLength > 12 ? '2rem' : hiraganaLength > 8 ? '2.4rem' : '3.2rem';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f9ff', padding: '30px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#ffffff', padding: '35px 45px', borderRadius: '24px', boxShadow: '0 15px 35px rgba(56,189,248,0.1)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e0f2fe', paddingBottom: '20px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', background: '#0284c7', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>🌊</div>
            <h2 style={{ margin: 0, color: '#0369a1', fontSize: '1.6rem', fontWeight: '800' }}>Minna Flashcard Pro</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              style={{ backgroundColor: isAutoPlay ? '#0284c7' : '#e0f2fe', color: isAutoPlay ? 'white' : '#0369a1', border: 'none', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s' }}
            >
              {isAutoPlay ? '⏸ Dừng Tự Động' : '▶ Tự Động Học'}
            </button>
            <button 
              onClick={() => setRole(null)} 
              style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Modal Chúc Mừng Hoàn Thành */}
        {showCelebration && (
          <div style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 100%)', padding: '25px', borderRadius: '16px', textAlign: 'center', marginBottom: '25px', color: '#0369a1' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>🎉 Chúc mừng bạn đã hoàn thành bài học!</h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem' }}>Bạn đã ôn tập toàn bộ từ vựng trong bài này. Thật xuất sắc!</p>
            <button onClick={() => {setShowCelebration(false); setCurrentIndex(0);}} style={{ padding: '10px 20px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Học Lại Từ Đầu</button>
          </div>
        )}

        {/* Bảng Admin */}
        {role === 'admin' && (
          <div style={{ background: '#f0f9ff', padding: '25px', borderRadius: '16px', marginBottom: '25px', border: '2px dashed #38bdf8' }}>
            <h3 style={{ marginTop: 0, color: '#0369a1', textAlign: 'center', marginBottom: '18px', fontSize: '1.2rem' }}>🌊 Bảng Thêm Từ Vựng Mới (Admin)</h3>
            <form onSubmit={handleAddWord} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input placeholder="Bài học (VD: Bài 26)" value={newWord.level} onChange={e => setNewWord({...newWord, level: e.target.value})} required style={{width: '130px', padding: '11px', border: '1px solid #38bdf8', borderRadius: '8px'}}/>
              <input placeholder="Hiragana" value={newWord.hiragana} onChange={e => setNewWord({...newWord, hiragana: e.target.value})} required style={{padding: '11px', border: '1px solid #38bdf8', borderRadius: '8px'}} />
              <input placeholder="Kanji" value={newWord.kanji} onChange={e => setNewWord({...newWord, kanji: e.target.value})} style={{padding: '11px', border: '1px solid #38bdf8', borderRadius: '8px'}} />
              <input placeholder="Nghĩa" value={newWord.meaning} onChange={e => setNewWord({...newWord, meaning: e.target.value})} required style={{padding: '11px', border: '1px solid #38bdf8', borderRadius: '8px'}} />
              <button type="submit" style={{ padding: '11px 24px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Lưu Vào DB</button>
            </form>
          </div>
        )}

        {/* Chọn bài học */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
          <label style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0369a1' }}>📚 Chọn Bài Học:</label>
          <select value={currentDeck} onChange={e => {setCurrentDeck(e.target.value); setCurrentIndex(0); setIsFlipped(false); setShowCelebration(false);}} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '1.05rem', border: '2px solid #bae6fd', cursor: 'pointer', outline: 'none', backgroundColor: '#ffffff', fontWeight: '600', color: '#0369a1' }}>
            {lessonsAvailable.map(lesson => (
               <option key={lesson} value={lesson}>{lesson}</option>
            ))}
          </select>
        </div>

        {/* Tiến độ */}
        {currentDeckList.length > 0 && (
          <div style={{ maxWidth: '600px', margin: '0 auto 20px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: '#0369a1', marginBottom: '6px' }}>
              <span>Tiến độ bài học</span>
              <span>{currentIndex + 1} / {currentDeckList.length} từ</span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#e0f2fe', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, backgroundColor: '#0284c7', height: '100%', transition: 'width 0.3s ease', borderRadius: '4px' }}></div>
            </div>
          </div>
        )}

        {/* Thẻ Flashcard 3D Glassmorphism */}
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
              boxShadow: '0 20px 40px rgba(56,189,248,0.18)'
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
                border: '2px solid #bae6fd', 
                padding: '20px 30px',
                boxSizing: 'border-box'
              }}>
                <span style={{ position: 'absolute', top: '16px', left: '20px', fontSize: '0.75rem', fontWeight: 'bold', color: '#0284c7', background: '#e0f2fe', padding: '4px 10px', borderRadius: '6px' }}>Mặt Trước (Hiragana)</span>
                
                {/* Nút đánh dấu đã thuộc */}
                <button
                  onClick={(e) => toggleMastered(currentWord.id || currentIndex, e)}
                  style={{ position: 'absolute', top: '14px', right: '60px', background: masteredWords[currentWord.id || currentIndex] ? '#dcfce7' : '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', color: masteredWords[currentWord.id || currentIndex] ? '#15803d' : '#0369a1' }}
                >
                  {masteredWords[currentWord.id || currentIndex] ? '✓ Đã Nhớ' : '☆ Đánh Dấu Nhớ'}
                </button>

                <button 
                  onClick={(e) => speakWord(currentWord.hiragana, e)}
                  style={{ position: 'absolute', top: '14px', right: '16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
                  title="Nghe phát âm"
                >
                  🔊
                </button>

                <h1 style={{ 
                  fontSize: dynamicFontSize, 
                  margin: '15px 0 0 0', 
                  color: '#0369a1', 
                  fontFamily: '"Meiryo", "Hiragino Sans", "MS PGothic", sans-serif',
                  letterSpacing: '2px',
                  lineHeight: '1.4',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  maxWidth: '100%'
                }}>
                  {currentWord.hiragana}
                </h1>
                <span style={{ color: '#38bdf8', fontSize: '0.85rem', marginTop: '15px' }}>Bấm vào thẻ để lật mặt sau ⟳</span>
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
                backgroundColor: '#f8fafc', 
                borderRadius: '24px', 
                border: '2px solid #38bdf8', 
                transform: 'rotateY(180deg)',
                padding: '20px 30px',
                boxSizing: 'border-box'
              }}>
                <span style={{ position: 'absolute', top: '16px', left: '20px', fontSize: '0.75rem', fontWeight: 'bold', color: '#0369a1', background: '#bae6fd', padding: '4px 10px', borderRadius: '6px' }}>Mặt Sau (Kanji & Nghĩa)</span>
                
                <h2 style={{ 
                  fontSize: dynamicFontSize, 
                  margin: '10px 0 8px 0', 
                  color: '#0369a1',
                  fontFamily: '"Meiryo", "Hiragino Sans", "MS PGothic", sans-serif',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  maxWidth: '100%'
                }}>
                  {currentWord.kanji || currentWord.hiragana}
                </h2>
                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px 0', color: '#0284c7', fontWeight: '700', textAlign: 'center' }}>
                  {currentWord.meaning}
                </h3>
                <span style={{ color: '#38bdf8', fontSize: '0.85rem' }}>Bấm vào thẻ để lật về mặt trước ⟳</span>
              </div>

            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#0369a1' }}>
            <p style={{ fontSize: '1.1rem' }}>🌊 Bài học này hiện chưa có từ vựng nào.</p>
          </div>
        )}
        
        {/* Nút điều hướng */}
        {currentWord && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '35px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {setIsFlipped(false); setCurrentIndex((prev) => (prev === 0 ? currentDeckList.length - 1 : prev - 1))}} 
              style={{ fontSize: '1rem', padding: '13px 24px', backgroundColor: '#38bdf8', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(56,189,248,0.25)' }}
            >
              ⬅ Từ trước
            </button>

            <button 
              onClick={() => {
                setIsFlipped(false); 
                if (currentIndex < currentDeckList.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                } else {
                  setCurrentIndex(0);
                  setShowCelebration(true);
                }
              }} 
              style={{ fontSize: '1rem', padding: '13px 28px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(2,132,199,0.25)' }}
            >
              Từ tiếp theo ➔
            </button>

            {role === 'admin' && (
              <button 
                onClick={() => handleDeleteWord(currentWord.id)}
                style={{ fontSize: '1rem', padding: '13px 20px', backgroundColor: '#0369a1', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 12px rgba(3,105,161,0.25)' }}
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