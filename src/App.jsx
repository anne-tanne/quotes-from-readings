import { useState, useEffect, useMemo, useCallback } from 'react';
import Prism from './Prism';
import './App.css';

// Default quotes as fallback
const defaultQuotes = [
  {
    "text": "The crisis here is realizing that we all together are somehow responsible, and must discover what to do all together."
  },
  {
    "text": "I call this the crisis of emptiness – because one must quickly empty oneself of expectations if anything new is to happen."
  },
  {
    "text": "One cannot \"outthink\" a crisis; one has to go through it."
  },
  {
    "text": "If there is pollution in the river of our thought, then we have essentially two strategies we might pursue: removing the pollution from the river downstream, or changing something farther upstream."
  }
];

function App() {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [isChanging, setIsChanging] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quoteQueue, setQuoteQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  useEffect(() => {
    // Load quotes on mount - try fetch first, fallback to defaults
    setIsLoading(true);
    
    const loadQuotes = async () => {
      try {
        const res = await fetch('/quotes.json');
        if (res.ok) {
          const data = await res.json();
          console.log('Quotes loaded from file:', data);
          if (data && Array.isArray(data) && data.length > 0) {
            const shuffled = shuffleArray(data);
            setQuotes(data);
            setQuoteQueue(shuffled);
            setQueueIndex(0);
            // Use requestAnimationFrame to ensure smooth initial render
            requestAnimationFrame(() => {
              setCurrentQuote(shuffled[0]);
            });
          } else {
            // Fallback to default quotes
            const shuffled = shuffleArray(defaultQuotes);
            setQuotes(defaultQuotes);
            setQuoteQueue(shuffled);
            setQueueIndex(0);
            requestAnimationFrame(() => {
              setCurrentQuote(shuffled[0]);
            });
          }
        } else {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      } catch (err) {
        console.error('Error loading quotes, using defaults:', err);
        // Use default quotes if fetch fails
        const shuffled = shuffleArray(defaultQuotes);
        setQuotes(defaultQuotes);
        setQuoteQueue(shuffled);
        setQueueIndex(0);
        requestAnimationFrame(() => {
          setCurrentQuote(shuffled[0]);
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuotes();
  }, [shuffleArray]);

  const getNextQuote = useCallback(() => {
    if (quoteQueue.length === 0) return null;
    
    const nextIndex = queueIndex + 1;
    
    // If we've gone through all quotes, shuffle again and start over
    if (nextIndex >= quoteQueue.length) {
      const reshuffled = shuffleArray(quotes);
      setQuoteQueue(reshuffled);
      setQueueIndex(0);
      return reshuffled[0];
    }
    
    setQueueIndex(nextIndex);
    return quoteQueue[nextIndex];
  }, [quoteQueue, queueIndex, quotes, shuffleArray]);

  const changeQuote = useCallback(() => {
    setIsChanging(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        const newQuote = getNextQuote();
        if (newQuote) {
          setCurrentQuote(newQuote);
        }
        setIsChanging(false);
      }, 300);
    });
  }, [getNextQuote]);

  return (
    <div className="app">
      <div className="background">
        <Prism
          animationType="rotate"
          timeScale={0.4}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
        />
      </div>
      
      <h1 className="title">Words of Wisdom</h1>
      
      <div className="content">
        <div className={`quote-container ${isChanging ? 'fade-out' : 'fade-in'}`}>
          {isLoading ? (
            <div className="quote-text">Loading...</div>
          ) : currentQuote ? (
            <blockquote className="quote-text">
              {currentQuote.text}
            </blockquote>
          ) : (
            <div className="quote-text">No quotes available</div>
          )}
        </div>
        
        <button 
          className="new-quote-button" 
          onClick={changeQuote}
          disabled={quotes.length === 0}
        >
          New Quote
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default App;

