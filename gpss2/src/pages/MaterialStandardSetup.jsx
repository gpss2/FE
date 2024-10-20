import React, { useState } from 'react';

const MaterialStandardSetup = () => {
    const [activeTab, setActiveTab] = useState('standard'); // 기본 탭 설정

    return (
        <div className="p-4 m-4 bg-slate-200 font-sans h-[86vh] rounded-lg">
            {/* Tabs 메뉴 */}
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 mb-8">
                <button
                    className={`pb-2 text-lg ${
                        activeTab === 'standard'
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-600'
                    }`}
                    onClick={() => setActiveTab('standard')}
                >
                    <b>자재표준 셋업</b>
                </button>
                <button
                    className={`pb-2 text-lg ${
                        activeTab === 'registration'
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-600'
                    }`}
                    onClick={() => setActiveTab('registration')}
                >
                    <b>자재입고 등록</b>
                </button>
                <button
                    className={`pb-2 text-lg ${
                        activeTab === 'specification'
                            ? 'border-b-2 border-blue-500 text-blue-500'
                            : 'text-gray-600'
                    }`}
                    onClick={() => setActiveTab('specification')}
                >
                    <b>규격품목 셋업</b>
                </button>
            </div>

            {/* Tab에 따른 컨텐츠 */}
            <div>
                {activeTab === 'standard' && (
                    <div className="grid grid-cols-2 gap-8">
                        {/* 자재표준 셋업 테이블 */}
                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            자재코드
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            자재타입
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            자재길이(mm)
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            단중(kg/m)
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            Apple MacBook Pro 17"
                                        </th>
                                        <td className="px-6 py-4">Silver</td>
                                        <td className="px-6 py-4">Laptop</td>
                                        <td className="px-6 py-4">$2999</td>
                                        <td className="px-6 py-4 text-right">
                                            <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                        </td>
                                    </tr>
                                    {/* 추가 행들 */}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* 두 번째 테이블 */}
                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Product name
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Color
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Category
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            Apple MacBook Pro 17"
                                        </th>
                                        <td className="px-6 py-4">Silver</td>
                                        <td className="px-6 py-4">Laptop</td>
                                        <td className="px-6 py-4">$2999</td>
                                        <td className="px-6 py-4 text-right">
                                            <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                        </td>
                                    </tr>
                                    {/* 추가 행들 */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'registration' && (
                    <div>
                        <h2 className="text-lg font-medium text-gray-700">자재입고 등록 페이지</h2>
                        {/* 자재입고 등록 관련 내용 */}
                    </div>
                )}

                {activeTab === 'specification' && (
                    <div>
                        <h2 className="text-lg font-medium text-gray-700">규격품목 셋업 페이지</h2>
                        {/* 규격품목 셋업 관련 내용 */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialStandardSetup;
