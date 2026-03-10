import { useState, useMemo } from 'react'
import { Search, Globe, Menu, X, ChevronDown, ChevronUp, Linkedin, SlidersHorizontal } from 'lucide-react'
import './App.css'

// --- Types ---
interface Provider {
  id: string
  name: string
  games: number
  color: string
  initial: string
  website?: string
  description?: string
}

interface Game {
  id: string
  title: string
  provider: string
  image: string
  badge?: string
}

interface FaqItem {
  question: string
  answer: string
}

// --- Mock Data ---
const PROVIDERS: Provider[] = [
  { id: 'adell', name: 'Adell Games', games: 55, color: '#1a1a2e', initial: 'AG', website: 'adellgames.com', description: 'Adell Games is a dynamic gaming studio specializing in innovative slot games with unique mechanics and engaging themes. Their portfolio features cutting-edge graphics and immersive gameplay experiences.' },
  { id: 'bbin', name: 'Bbin', games: 27, color: '#e63946', initial: 'B', website: 'bbin.com', description: 'BBIN is one of the largest gaming platforms in Asia, providing a comprehensive suite of gaming products including sports betting, live casino, and slot games.' },
  { id: 'amusnet', name: 'Amusnet Interactive (EGT)', games: 23, color: '#2a9d8f', initial: 'A', website: 'amusnetinteractive.com', description: 'Amusnet Interactive, formerly known as EGT Interactive, is a leading provider of online gaming solutions with over 250 games in their portfolio.' },
  { id: 'solidicon', name: 'Solidicon', games: 5, color: '#264653', initial: 'S', website: 'solidicon.com', description: 'Solidicon delivers high-quality gaming content with a focus on innovative mechanics and stunning visual design.' },
  { id: 'pragmatic', name: 'Pragmatic Play', games: 1350, color: '#e76f51', initial: 'PP', website: 'pragmaticplay.com', description: 'Pragmatic Play is a casino games studio with a huge selection of online slots and live casino games that combines exciting bonus features, awesome graphics, and big wins. From the sands of ancient Egypt to the wild American West, Pragmatic Play games provide something for everyone.' },
  { id: 'booming', name: 'Booming Games', games: 37, color: '#f4a261', initial: 'BG', website: 'boominggames.com', description: 'Booming Games is an innovative game development studio creating HTML5 casino games with unique themes and engaging gameplay.' },
  { id: 'lightandwonder', name: 'Light and Wonder', games: 115, color: '#6c757d', initial: 'LW', website: 'lnw.com', description: 'Light & Wonder is a leading cross-platform global games company providing premium gaming content.' },
  { id: 'netent', name: 'NetEnt', games: 12, color: '#495057', initial: 'NE', website: 'netent.com', description: 'NetEnt is a premium supplier of digitally distributed gaming systems used by some of the world\'s most successful online gaming operators.' },
  { id: 'cego', name: 'CEGO', games: 23, color: '#343a40', initial: 'C', website: 'cego.com', description: 'CEGO is a Danish gaming company delivering entertaining gaming experiences across multiple platforms.' },
  { id: 'kingshow', name: 'King Show Games', games: 19, color: '#6f42c1', initial: 'KS', website: 'kingshowgames.com', description: 'King Show Games creates visually stunning slot games with innovative bonus features and engaging narratives.' },
  { id: 'medialive', name: 'Medialive Casino', games: 1300, color: '#d63384', initial: 'MC', website: 'medialivecasino.com', description: 'Medialive Casino is a live dealer gaming provider offering real-time streaming casino experiences.' },
  { id: '7777', name: '7777 Gaming', games: 44, color: '#fd7e14', initial: '77', website: '7777gaming.com', description: '7777 Gaming offers a diverse portfolio of slot games with unique themes and innovative features.' },
  { id: 'spinthon', name: 'Spinthon', games: 12, color: '#20c997', initial: 'SP', website: 'spinthon.com', description: 'Spinthon creates engaging slot games with modern designs and exciting bonus mechanics.' },
]

const FEATURED_GAMES: Game[] = [
  { id: 'bigbass', title: 'Big Bass Bonanza', provider: 'Pragmatic Play', image: '/images/game-bigbass.jpg', badge: 'Featured game' },
  { id: 'wolfgold', title: 'Wolf Gold', provider: 'Pragmatic Play', image: '/images/game-wolfgold.jpg' },
  { id: 'sweetbonanza', title: 'Sweet Bonanza', provider: 'Pragmatic Play', image: '/images/game-sweetbonanza.jpg' },
  { id: 'gateofolympus', title: 'Gates of Olympus', provider: 'Pragmatic Play', image: '/images/game-gatesofolympus.jpg' },
]

const FAQS: FaqItem[] = [
  { question: 'How is the game list sorted?', answer: 'By default, games are shown using a balanced order that highlights popular and high-interest titles. You can use search and filters to quickly narrow the catalog to what you need.' },
  { question: 'Why do some games look similar or appear more than once?', answer: 'Some game providers release variations of popular titles with different themes or mechanics. These are separate games with unique features, even if they share a similar base concept.' },
  { question: 'What does "Provider" mean?', answer: 'A provider (also called a game studio or supplier) is the company that develops and publishes the games. Each provider has their own unique style, themes, and game mechanics.' },
  { question: 'I can\'t find a game \u2014 what should I do?', answer: 'Try using the search bar to find games by name. If the game is still not available, it might not be offered by any of our current providers. Contact support for more information.' },
]

// --- Components ---

function Header({ currentPage, onNavigate, onMenuToggle }: {
  currentPage: string
  onNavigate: (page: string) => void
  onMenuToggle: () => void
}) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <button onClick={() => onNavigate('providers')} className="text-lg font-bold text-neutral-900">
            Company
          </button>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('providers')}
              className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Games
            </button>
            <button
              onClick={() => onNavigate('providers')}
              className={`text-sm font-medium transition-colors ${currentPage.includes('provider') ? 'text-neutral-900 underline underline-offset-8 decoration-2' : 'text-neutral-500 hover:text-neutral-900'}`}
            >
              Providers
            </button>
            <button className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
              About
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-100 transition-colors">
              <Search className="w-4 h-4 text-neutral-600" />
            </button>
            <button className="hidden md:flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              <Globe className="w-4 h-4" />
              <span>ENG</span>
            </button>
            <button className="hidden md:inline-flex px-4 py-1.5 text-sm font-medium text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
              Log in
            </button>
            <button className="hidden md:inline-flex px-4 py-1.5 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
              Sign up
            </button>
            <button className="md:hidden flex items-center justify-center w-8 h-8">
              <Search className="w-5 h-5 text-neutral-600" />
            </button>
            <button onClick={onMenuToggle} className="md:hidden p-1">
              <Menu className="w-5 h-5 text-neutral-900" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function MobileMenu({ isOpen, onClose, onNavigate }: {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
}) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 bg-white md:hidden">
      <div className="flex items-center justify-between px-4 h-14 border-b border-neutral-200">
        <span className="text-lg font-bold text-neutral-900">Company</span>
        <button onClick={onClose} className="p-1"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Menu</h2>
        <nav className="space-y-4">
          <button onClick={() => { onNavigate('providers'); onClose() }} className="block text-base text-neutral-500 hover:text-neutral-900">Games</button>
          <button onClick={() => { onNavigate('providers'); onClose() }} className="block text-base font-medium text-neutral-900">Providers</button>
          <button onClick={onClose} className="block text-base text-neutral-500 hover:text-neutral-900">About</button>
        </nav>
      </div>
    </div>
  )
}

function ProviderCard({ provider, onClick }: { provider: Provider; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors w-full text-left"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: provider.color }}
      >
        {provider.initial}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900 truncate">{provider.name}</p>
        <p className="text-xs text-neutral-500">{provider.games.toLocaleString()} games</p>
      </div>
    </button>
  )
}

function Accordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="divide-y divide-neutral-200">
      {items.map((item, i) => (
        <div key={i} className="py-4">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex items-start justify-between w-full text-left gap-4"
          >
            <span className="text-sm font-medium text-neutral-900">
              {i + 1}. {item.question}
            </span>
            {openIndex === i ? (
              <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
            )}
          </button>
          {openIndex === i && (
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed pl-4">
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function Breadcrumbs({ items, onNavigate }: { items: { label: string; page?: string }[]; onNavigate: (page: string) => void }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {item.page ? (
            <button onClick={() => onNavigate(item.page!)} className="hover:text-neutral-900 transition-colors">
              {item.label}
            </button>
          ) : (
            <span className="text-neutral-400">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-neutral-100 border-t border-neutral-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <span className="text-lg font-bold text-neutral-900">Company</span>
          <button className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            <Globe className="w-4 h-4" />
            <span>ENG</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Catalog</h4>
            <ul className="space-y-2">
              <li><button className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Providers</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">About</h4>
            <ul className="space-y-2">
              <li><button className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Company</button></li>
              <li><button className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Contact</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><button className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Terms of service</button></li>
              <li><button className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Privacy policy</button></li>
              <li><button className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Cookies settings</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Follow us</h4>
            <a href="#" className="inline-flex items-center justify-center w-8 h-8 rounded bg-neutral-900 hover:bg-neutral-700 transition-colors">
              <Linkedin className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>

        <div className="border-t border-neutral-300 pt-6 text-center">
          <p className="text-xs text-neutral-500 leading-relaxed">
            Gambling can be addictive. Play responsibly. 3PROJECT.com accepts customers only over 18 years of age.
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            2026 &copy; 3PROJECT.com All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// --- Pages ---

function ProvidersPage({ onSelectProvider }: { onSelectProvider: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)

  const filteredProviders = useMemo(() => {
    let result = [...PROVIDERS]
    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    }
    if (sortBy === 'popular') {
      result.sort((a, b) => b.games - a.games)
    } else if (sortBy === 'az') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }
    return result
  }, [search, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Browse providers</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search providers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Show Filters</span>
            <span className="sm:hidden">Filters</span>
          </button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-8 border border-neutral-300 rounded-lg text-sm text-neutral-700 bg-white outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors cursor-pointer"
            >
              <option value="popular">Sort by: Most Popular</option>
              <option value="az">Sort by: A-Z</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 border border-neutral-200 rounded-xl bg-neutral-50">
          <p className="text-sm text-neutral-500">Filter options coming soon...</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
        {filteredProviders.map(provider => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onClick={() => onSelectProvider(provider.id)}
          />
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500">No providers found matching &quot;{search}&quot;</p>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button className="px-6 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
          Show more providers
        </button>
      </div>

      <section className="mt-16">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">FAQs</h2>
        <Accordion items={FAQS} />
      </section>
    </div>
  )
}

function ProviderDetailPage({ providerId, onNavigate }: { providerId: string; onNavigate: (page: string) => void }) {
  const provider = PROVIDERS.find(p => p.id === providerId)
  const [showFullDesc, setShowFullDesc] = useState(false)

  if (!provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-neutral-500">Provider not found.</p>
        <button onClick={() => onNavigate('providers')} className="mt-4 text-sm text-neutral-900 underline">
          Back to providers
        </button>
      </div>
    )
  }

  const games = FEATURED_GAMES.map(g => ({ ...g, provider: provider.name }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'Providers', page: 'providers' },
          { label: provider.name },
        ]}
        onNavigate={onNavigate}
      />

      <div className="flex flex-col md:flex-row md:items-start gap-6 mb-10">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
          style={{ backgroundColor: provider.color }}
        >
          {provider.initial}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{provider.name}</h1>
          {provider.website && (
            <a href={`https://${provider.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
              {provider.website}
            </a>
          )}
          <p className="text-sm text-neutral-500 mt-1">{provider.games.toLocaleString()} games</p>
        </div>
      </div>

      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <div key={game.id} className="group">
              <div className="relative rounded-xl overflow-hidden bg-neutral-100 aspect-video mb-3">
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `https://placehold.co/400x220/${provider.color.replace('#', '')}/ffffff?text=${encodeURIComponent(game.title)}`
                  }}
                />
                {game.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-neutral-700">
                    {game.badge}
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-neutral-900">{game.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                {game.badge && <span className="text-xs text-neutral-500">{game.badge}</span>}
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: provider.color, fontSize: '7px', fontWeight: 'bold' }}
                  >
                    {provider.initial}
                  </div>
                  <span className="text-xs text-neutral-500">{provider.name}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                One place to browse, evaluate, and discover games at scale. Designed to reduce friction and make exploration effortless on both desktop and mobile.
              </p>
              <button className="mt-3 px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors">
                View game
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-neutral-900 mb-3">About {provider.name}</h2>
        <p className="text-sm text-neutral-600 leading-relaxed">
          {showFullDesc || !provider.description || provider.description.length <= 200
            ? provider.description
            : (provider.description.slice(0, 200) + '...')}
        </p>
        {provider.description && provider.description.length > 200 && (
          <button
            onClick={() => setShowFullDesc(!showFullDesc)}
            className="mt-2 text-sm font-medium text-neutral-900 underline hover:text-neutral-700 transition-colors"
          >
            {showFullDesc ? 'Show less' : 'Learn more'}
          </button>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">FAQs</h2>
        <Accordion items={FAQS} />
      </section>
    </div>
  )
}

// --- App ---

function App() {
  const [currentPage, setCurrentPage] = useState('providers')
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
    setSelectedProvider(null)
    window.scrollTo(0, 0)
  }

  const handleSelectProvider = (id: string) => {
    setSelectedProvider(id)
    setCurrentPage('provider-detail')
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onMenuToggle={() => setMobileMenuOpen(true)}
      />
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        {currentPage === 'providers' && (
          <ProvidersPage onSelectProvider={handleSelectProvider} />
        )}
        {currentPage === 'provider-detail' && selectedProvider && (
          <ProviderDetailPage providerId={selectedProvider} onNavigate={handleNavigate} />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
