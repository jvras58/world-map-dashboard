import Link from "next/link"
import { Search, Settings, HelpCircle } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm z-10 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-10">
        <div className="font-bold text-2xl">
          <span className="text-black">Global</span>
          <span className="text-teal-500">Satisfaction</span>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="#" className="text-gray-700 hover:text-teal-500">
                Products
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-700 hover:text-teal-500">
                Analytics
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-700 hover:text-teal-500">
                Regions
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-700 hover:text-teal-500">
                About Us
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-600 hover:text-teal-500">
          <Search size={20} />
        </button>
        <button className="p-2 text-gray-600 hover:text-teal-500">
          <Settings size={20} />
        </button>
        <button className="p-2 text-gray-600 hover:text-teal-500">
          <HelpCircle size={20} />
        </button>
        <button className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600">Sign In</button>
      </div>
    </header>
  )
}
