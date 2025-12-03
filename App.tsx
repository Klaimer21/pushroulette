import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
// Push Chain SDK Imports
import {
  PushUniversalWalletProvider,
  PushUniversalAccountButton,
  usePushWalletContext,
  usePushChainClient,
  usePushChain,
  PushUI,
} from '@pushchain/ui-kit';

// ⚠️ REPLACE WITH YOUR DEPLOYED CONTRACT ADDRESS
const CONTRACT_ADDRESS = '0x8faE1a613C2741D5db886551839355566F86874D' as const;
const RPC_URL = 'https://evm.donut.rpc.push.org/';

// Contract ABI
const ROULETTE_ABI_JSON = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "spin",
    "inputs": [],
    "outputs": [
      {
        "name": "prize",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getStats",
    "inputs": [],
    "outputs": [
      {
        "name": "contractBalance",
        "type": "uint256"
      },
      {
        "name": "availableBalance",
        "type": "uint256"
      },
      {
        "name": "spinCost",
        "type": "uint256"
      },
      {
        "name": "isPaused",
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlayerStats",
    "inputs": [
      {
        "name": "player",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "totalSpins",
        "type": "uint256"
      },
      {
        "name": "totalWins",
        "type": "uint256"
      },
      {
        "name": "lastSpinTime",
        "type": "uint256"
      },
      {
        "name": "canSpinAgainAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "SpinRevealed",
    "inputs": [
      {
        "name": "player",
        "type": "address",
        "indexed": true
      },
      {
        "name": "betAmount",
        "type": "uint256",
        "indexed": false
      },
      {
        "name": "prizeAmount",
        "type": "uint256",
        "indexed": false
      },
      {
        "name": "randomNumber",
        "type": "uint256",
        "indexed": false
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "type": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "paused",
    "inputs": [],
    "outputs": [
      {
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  }
];

const PRIZES = [
  { amount: 0, probability: 60, label: 'Try Again', gradient: ['#4B5563', '#374151'] },
  { amount: 0.05, probability: 30, label: '0.05 PC', gradient: ['#3B82F6', '#2563EB'] },
  { amount: 0.1, probability: 5, label: '0.1 PC', gradient: ['#10B981', '#059669'] },
  { amount: 0.2, probability: 3, label: '0.2 PC', gradient: ['#F59E0B', '#D97706'] },
  { amount: 0.5, probability: 1.5, label: '0.5 PC', gradient: ['#F97316', '#EA580C'] },
  { amount: 1, probability: 0.5, label: '1 PC', gradient: ['#9333EA', '#7C3AED'] }
];

// --- КОМПОНЕНТ КОЛЕСА ---
const RouletteWheel = ({ 
  isSpinning, 
  prizeIndex, 
  onSpinEnd 
}: { 
  isSpinning: boolean; 
  prizeIndex: number | null; 
  onSpinEnd: () => void 
}) => {
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    // 1. Стадия ожидания (пока ждем ответ блокчейна)
    if (isSpinning && prizeIndex === null) {
       setRotation(r => r + 45);
    }

    // 2. Стадия результата
    // ВАЖНО: Добавлена проверка && isSpinning. 
    // Это предотвращает повторный запуск анимации, когда родитель меняет isSpinning на false в конце игры.
    if (prizeIndex !== null && isSpinning) {
      const segmentAngle = 360 / PRIZES.length;
      
      const targetBaseAngle = (360 - (prizeIndex * segmentAngle)) - (segmentAngle / 2);
      const randomOffset = (Math.random() * 20) - 10; 
      
      const currentRotation = rotation;
      const spins = 5 * 360;
      
      const remainder = currentRotation % 360;
      const adjustment = (targetBaseAngle - remainder + 360) % 360;
      
      const finalRotation = currentRotation + spins + adjustment + randomOffset;
      
      setRotation(finalRotation);

      const timer = setTimeout(() => {
        onSpinEnd();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [prizeIndex, isSpinning]);

  const segmentAngle = 360 / PRIZES.length;

  return (
    <div className="relative w-96 h-96 mx-auto">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-30 blur-2xl animate-pulse" />
      
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl flex items-center justify-center border-8 border-purple-500/30">
        <div 
          className="w-80 h-80 rounded-full relative"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            // Анимация срабатывает, только если мы активно крутим колесо к результату
            transition: (prizeIndex !== null && isSpinning)
              ? 'transform 5s cubic-bezier(0.15, 0.80, 0.20, 1)' 
              : 'transform 0.8s linear' 
          }}
        >
          {PRIZES.map((prize, index) => {
            const startAngle = (segmentAngle * index - 90) * (Math.PI / 180);
            const endAngle = (segmentAngle * (index + 1) - 90) * (Math.PI / 180);
            const x1 = 160 + 160 * Math.cos(startAngle);
            const y1 = 160 + 160 * Math.sin(startAngle);
            const x2 = 160 + 160 * Math.cos(endAngle);
            const y2 = 160 + 160 * Math.sin(endAngle);
            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
            const pathData = `M 160 160 L ${x1} ${y1} A 160 160 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            const rotateAngle = segmentAngle * index + segmentAngle / 2;

            return (
              <svg key={index} className="absolute inset-0" viewBox="0 0 320 320" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={prize.gradient[0]} />
                    <stop offset="100%" stopColor={prize.gradient[1]} />
                  </linearGradient>
                </defs>
                <path d={pathData} fill={`url(#gradient-${index})`} stroke="#1F2937" strokeWidth="2" />
                <text 
                  x="160" 
                  y="55" 
                  textAnchor="middle" 
                  dominantBaseline="central" 
                  fill="white" 
                  fontSize="14" 
                  fontWeight="bold"
                  transform={`rotate(${rotateAngle}, 160, 160)`}
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {prize.label}
                </text>
              </svg>
            );
          })}
          <svg className="absolute inset-0" viewBox="0 0 320 320">
            <circle cx="160" cy="160" r="155" fill="none" stroke="#1F2937" strokeWidth="3" />
            <circle cx="160" cy="160" r="50" fill="none" stroke="#1F2937" strokeWidth="3" />
          </svg>
        </div>
        
        <div className="absolute w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-xl flex items-center justify-center border-4 border-gray-900">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl">
            🎰
          </div>
        </div>
      </div>
      
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
        <div className="w-6 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-b-full shadow-lg rotate-180" 
             style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      </div>
    </div>
  );
};

// Main Game Component
const RouletteGame = () => {
  const { connectionStatus } = usePushWalletContext();
  const { pushChainClient } = usePushChainClient();
  const { PushChain } = usePushChain();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState<number | null>(null);
  const [currentPrize, setCurrentPrize] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [totalSpins, setTotalSpins] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [spinCost, setSpinCost] = useState<string>('0.1'); 
  const [balance, setBalance] = useState<string>('0');
  const [userAddress, setUserAddress] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isConnected = connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED;

  const fetchAccountInfo = async () => {
    if (isConnected && pushChainClient) {
      setIsRefreshing(true);
      try {
        const account = pushChainClient.universal.account;
        const accountStr = typeof account === 'string' ? account : (account as any)?.address;
        const address = accountStr && accountStr.includes(':') ? accountStr.split(':').pop() : accountStr;
        setUserAddress(address || '');

        if (address) {
          const provider = new ethers.JsonRpcProvider(RPC_URL);
          const bal = await provider.getBalance(address);
          setBalance(ethers.formatEther(bal));
        }
      } catch (e) {
        console.error("Error fetching account info", e);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, [isConnected, pushChainClient]);

  useEffect(() => {
    const fetchGameStats = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ROULETTE_ABI_JSON, provider);
        const stats = await contract.getStats();
        setSpinCost(ethers.formatEther(stats.spinCost));
      } catch (e) {
        console.warn("Using default cost", e);
      }
    };
    fetchGameStats();
  }, []);

  const handleSpin = async () => {
    if (isSpinning || isProcessing || !isConnected || !pushChainClient) return;
    
    setIsProcessing(true); // "Waiting for confirmation..."
    setIsSpinning(true);   // Запускаем режим вращения
    setShowResult(false);
    setCurrentPrize(null);
    setPrizeIndex(null);   // Сбрасываем индекс, пока не знаем ответ контракта
    setError(null);

    try {
      // 1. Подготовка транзакции
      const data = PushChain.utils.helpers.encodeTxData({
        abi: ROULETTE_ABI_JSON,
        functionName: 'spin',
        args: []
      });
      
      const costInWei = PushChain.utils.helpers.parseUnits(spinCost, 18);
      
      // 2. Отправка транзакции
      const txResult = await pushChainClient.universal.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: costInWei,
        data: data as any,
      });

      const txHash = typeof txResult === 'string' ? txResult : txResult.hash;
      console.log('Transaction sent:', txHash);
      
      // 3. Ожидание подтверждения
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const txResponse = await provider.getTransaction(txHash);
      if (!txResponse) throw new Error("Transaction not found");
      
      const txReceipt = await txResponse.wait();
      console.log('Transaction confirmed!');
      
      setIsProcessing(false); // Подтверждено, переходим к фазе анимации выигрыша
      
      // 4. Получаем реальный выигрыш из логов события
      let prizeAmount = 0;
      try {
        const iface = new ethers.Interface(ROULETTE_ABI_JSON);
        if (txReceipt && txReceipt.logs) {
            for (const log of txReceipt.logs) {
              try {
                const parsed = iface.parseLog({ topics: Array.from(log.topics), data: log.data });
                if (parsed && parsed.name === 'SpinRevealed') {
                  prizeAmount = Number(ethers.formatUnits(parsed.args.prizeAmount, 18));
                  break;
                }
              } catch (e) { continue; }
            }
        }
      } catch (e) {
        console.warn('Log parsing failed', e);
      }
      
      // 5. Находим приз в нашем списке
      let foundIndex = PRIZES.findIndex(p => Math.abs(p.amount - prizeAmount) < 0.001);
      if (foundIndex === -1) foundIndex = 0; // Fallback на проигрыш

      const prize = PRIZES[foundIndex];
      setCurrentPrize(prize);
      
      // 6. Устанавливаем индекс - колесо начинает крутиться к нужной точке
      setPrizeIndex(foundIndex);
      
      // Обновляем баланс
      fetchAccountInfo();

    } catch (err: any) {
      console.error('Failed:', err);
      setIsSpinning(false);
      setIsProcessing(false);
      
      const errorMessage = err.message || JSON.stringify(err);
      if (errorMessage.includes("insufficient funds")) {
         setError(<div className="text-center">Insufficient Balance</div>);
      } else {
         setError(<div className="text-center">Transaction failed</div>);
      }
    }
  };

  const handleAnimationComplete = () => {
    // ВАЖНО: Останавливаем статус вращения
    setIsSpinning(false);
    setShowResult(true);
    
    if (currentPrize) {
      setTotalSpins(prev => prev + 1);
      if (currentPrize.amount > 0) {
        setTotalWins(prev => prev + currentPrize.amount);
      }
      setHistory(prev => [{ prize: currentPrize, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <header className="border-b border-purple-800/30 backdrop-blur-sm bg-gray-900/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center overflow-hidden p-1">
              {/* Логотип: используется /logo.png (из папки public) и обрезка углов */}
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-md" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Push Chain Roulette</h1>
              <p className="text-xs text-gray-400">Testnet</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {isConnected && userAddress && (
              <div className="hidden md:flex flex-col items-end mr-2">
                 <div className="text-xs text-gray-400 flex items-center gap-1">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                 </div>
                 <div className="text-sm font-bold flex items-center gap-2">
                    {parseFloat(balance).toFixed(4)} PC
                    <button onClick={fetchAccountInfo} className={`text-gray-400 hover:text-white ${isRefreshing ? 'animate-spin' : ''}`}>↻</button>
                 </div>
              </div>
            )}
            <PushUniversalAccountButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-purple-800/30">
              <div className="text-6xl mb-6">🎰</div>
              <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <PushUniversalAccountButton />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-800/30">
                
                <RouletteWheel 
                  isSpinning={isSpinning} 
                  prizeIndex={prizeIndex} 
                  onSpinEnd={handleAnimationComplete} 
                />
                
                {showResult && currentPrize && (
                  <div className="mt-6 text-center animate-bounce">
                    <div className={`inline-block px-6 py-3 rounded-xl ${
                      currentPrize.amount > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-700'
                    }`}>
                      {currentPrize.amount > 0 ? (
                        <div>
                          <div className="text-2xl font-bold">🎉 Congratulations!</div>
                          <div className="text-3xl font-bold mt-1">+{currentPrize.amount} PC</div>
                        </div>
                      ) : (
                        <div className="text-xl font-bold">Better luck next time!</div>
                      )}
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="mt-6 bg-red-500/20 border border-red-500 rounded-lg p-4 text-center text-red-400">
                    {error}
                  </div>
                )}
                
                <div className="mt-8 text-center">
                  <button
                    onClick={handleSpin}
                    disabled={isSpinning || isProcessing || !pushChainClient}
                    className={`px-12 py-4 rounded-xl font-bold text-xl transition-all ${
                      isSpinning || isProcessing
                        ? 'bg-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50 hover:scale-105'
                    }`}
                  >
                    {isProcessing ? 'Waiting for block...' : isSpinning ? 'Spinning...' : `Spin (${spinCost} PC)`}
                  </button>
                </div>
              </div>

              <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-800/30">
                <h3 className="text-xl font-bold mb-4">Prize Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PRIZES.map((prize, index) => (
                    <div key={index} style={{ background: `linear-gradient(135deg, ${prize.gradient[0]}, ${prize.gradient[1]})` }} 
                         className="rounded-lg p-3 hover:scale-105 transition-transform">
                      <div className="font-bold">{prize.label}</div>
                      <div className="text-sm opacity-90">{prize.probability}% chance</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-800/30">
                <h3 className="text-xl font-bold mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Spins</span>
                    <span className="font-bold text-xl">{totalSpins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Wins</span>
                    <span className="font-bold text-xl text-green-400">{totalWins.toFixed(2)} PC</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-800/30">
                <h3 className="text-xl font-bold mb-4">Recent Spins</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.map((item, index) => (
                      <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className={`font-bold ${item.prize.amount > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                            {item.prize.amount > 0 ? `+${item.prize.amount} PC` : 'No win'}
                          </span>
                          <span className="text-xs text-gray-400">{item.timestamp}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const walletConfig = {
    network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
    login: { email: true, google: true, wallet: { enabled: true } }
  };

  const appMetadata = {
    logoUrl: '/logolabel.png',
    title: 'Push Chain Roulette',
    description: 'Spin to win PC tokens on Push Chain Testnet'
  };

  return (
    <PushUniversalWalletProvider config={walletConfig} app={appMetadata} themeMode="dark">
      <RouletteGame />
    </PushUniversalWalletProvider>
  );
}

export default App;
