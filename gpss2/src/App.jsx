import React from 'react';
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import { FaCog, FaUser } from 'react-icons/fa'; // 아이콘 추가
import MaterialStandardSetup from './pages/MaterialStandardSetup';
import MaterialRegistration from './pages/MaterialRegistration';
import SpecItemSetup from './pages/SpecItemSetup';
import OrderListEntry from './pages/OrderListEntry';
import CuttingCondition from './pages/CuttingCondition';
import CuttingRange from './pages/CuttingRange';
import CuttingStart from './pages/CuttingStart';
import CuttingInProgress from './pages/CuttingInProgress';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-800">
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500&display=swap');`}
        </style>

        {/* 네비게이션 바 */}
        <nav className="bg-white border-gray-200 dark:bg-gray-900 relative">
          <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
            {/* 로고와 메뉴를 flex로 정렬 */}
            <div className="flex items-center space-x-8">
              {/* 로고 */}
              <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
                <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">GPSS II</span>
              </a>

              {/* 자재, 수주, 절단 계획 메뉴 */}
              <ul className="flex space-x-8">
                <li>
                  <Link
                    style={{ fontFamily: 'Noto-sans-KR' }}
                    to="/material-standard-setup"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                  >
                    <b>자재</b>
                  </Link>
                </li>
                <li>
                  <Link
                    style={{ fontFamily: 'Noto-sans-KR' }}
                    to="/order-list-entry"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                  >
                    <b>수주</b>
                  </Link>
                </li>
                <li>
                  <Link
                    style={{ fontFamily: 'Noto-sans-KR' }}
                    to="/cutting-condition"
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                  >
                    <b>절단 계획</b>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 중앙에 계획 시작 버튼 추가 */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <button className="border border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-bold py-2 px-4 rounded flex items-center space-x-2 transition-colors duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25v13.5l13.5-6.75-13.5-6.75z" />
                </svg>
                <span>계획 시작</span>
              </button>
            </div>

            {/* 설정 아이콘과 유저 아이콘 */}
            <div className="flex space-x-4">
              <button className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-full text-sm p-2">
                <FaCog className="w-6 h-6" />
              </button>
              <button className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-full text-sm p-2">
                <FaUser className="w-6 h-6" />
              </button>
            </div>
          </div>
        </nav>

        {/* 라우팅 설정 */}
        <Routes>
          <Route path="/material-standard-setup" element={<MaterialStandardSetup />} />
          <Route path="/material-registration" element={<MaterialRegistration />} />
          <Route path="/spec-item-setup" element={<SpecItemSetup />} />
          <Route path="/order-list-entry" element={<OrderListEntry />} />
          <Route path="/cutting-condition" element={<CuttingCondition />} />
          <Route path="/cutting-range" element={<CuttingRange />} />
          <Route path="/cutting-start" element={<CuttingStart />} />
          <Route path="/cutting-in-progress" element={<CuttingInProgress />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
