import React, { useState } from 'react';

const MaterialStandardSetup = () => {
    // 자재표준 셋업 테이블 더미 데이터
    const [standardData, setStandardData] = useState(
        Array(40).fill({
            materialCode: '-',   // 자재코드
            materialType: '-',   // 자재타입
            materialLength: '-', // 자재길이
            unitWeight: '-'      // 단중(kg/m)
        })
    );

    // 사양 테이블 더미 데이터
    const [specData, setSpecData] = useState(
        Array(40).fill({
            specCode: '-',      // 사양코드
            bbCode: '-',        // BB코드
            cbCode: '-',        // CB코드
            bPitch: '-',        // B 피치(mm)
            cPitch: '-',        // C 피치(mm)
            bladeThickness: '-' // 톱날 두께(mm)
        })
    );

    // 자재입고 테이블 더미 데이터
    const [registrationData, setRegistrationData] = useState(
        Array(40).fill({
            materialCode: '-',      // 자재코드
            incomingQuantity: '-',  // 입고수량(PCS)
            incomingWeight: '-'     // 입고 중량(kg)
        })
    );

    // 규격품목 셋업 테이블 더미 데이터
    const [specificationData, setSpecificationData] = useState(
        Array(40).fill({
            itemName: '-',   // 품명
            specCode: '-',   // 사양코드
            endBar: '-',     // End-bar
            itemType: '-',   // 품목종류
            width: '-',      // 폭(mm)
            length: '-',     // 길이(mm)
            cbCount: '-',    // CB수
            lep: '-',        // LEP(mm)
            rep: '-',        // REP(mm)
            weight: '-',     // 중량(kg)
            neWeight: '-'    // NE 중량(kg)
        })
    );

    const [activeTab, setActiveTab] = useState('standard'); // 기본 탭 설정

    return (
        <div className="p-4 min-h-[88vh] flex flex-col">
            {/* Tabs 메뉴 */}
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    className={`pb-2 text-lg ${activeTab === 'standard'
                        ? 'border-b-2 border-blue-500 text-blue-500'
                        : 'text-gray-600'
                        }`}
                    onClick={() => setActiveTab('standard')}
                >
                    <b>자재표준 셋업</b>
                </button>
                <button
                    className={`pb-2 text-lg ${activeTab === 'registration'
                        ? 'border-b-2 border-blue-500 text-blue-500'
                        : 'text-gray-600'
                        }`}
                    onClick={() => setActiveTab('registration')}
                >
                    <b>자재입고 등록</b>
                </button>
                <button
                    className={`pb-2 text-lg ${activeTab === 'specification'
                        ? 'border-b-2 border-blue-500 text-blue-500'
                        : 'text-gray-600'
                        }`}
                    onClick={() => setActiveTab('specification')}
                >
                    <b>규격품목 셋업</b>
                </button>
            </div>

            {/* Tab에 따른 컨텐츠 */}
            <div className="flex-grow h-[70vh] p-4 flex flex-col space-y-4">
                {activeTab === 'standard' && (
                     <div className="grid grid-cols-[4fr,6fr] gap-8 flex-grow">
                     {/* 첫 번째 테이블: 자재표준 셋업 테이블 */}
                     <div className="relative overflow-y-auto h-[65vh] shadow-md sm:rounded-lg" >
                         <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                                 <tr>
                                     <th scope="col" className="px-6 py-3">자재코드</th>
                                     <th scope="col" className="px-6 py-3">자재타입</th>
                                     <th scope="col" className="px-6 py-3">자재길이</th>
                                     <th scope="col" className="px-6 py-3">단중(kg/m)</th>
                                     <th scope="col" className="px-6 py-3"><span className="sr-only">Edit</span></th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {standardData.map((data, index) => (
                                     <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                         <th scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                             {data.materialCode}
                                         </th>
                                         <td className="px-6 py-2">{data.materialType}</td>
                                         <td className="px-6 py-2">{data.materialLength}</td>
                                         <td className="px-6 py-2">{data.unitWeight}</td>
                                         <td className="px-6 py-2 text-right">
                                             <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>

                     {/* 두 번째 테이블: 사양 테이블 */}
                     <div className="relative overflow-y-auto h-[65vh] shadow-md sm:rounded-lg">
                         <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                                 <tr>
                                     <th scope="col" className="px-6 py-3">사양코드</th>
                                     <th scope="col" className="px-6 py-3">BB코드</th>
                                     <th scope="col" className="px-6 py-3">CB코드</th>
                                     <th scope="col" className="px-6 py-3">B 피치(mm)</th>
                                     <th scope="col" className="px-6 py-3">C 피치(mm)</th>
                                     <th scope="col" className="px-6 py-3">톱날 두께(mm)</th>
                                     <th scope="col" className="px-6 py-3"><span className="sr-only">Edit</span></th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {specData.map((data, index) => (
                                     <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                         <th scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                             {data.specCode}
                                         </th>
                                         <td className="px-6 py-2">{data.bbCode}</td>
                                         <td className="px-6 py-2">{data.cbCode}</td>
                                         <td className="px-6 py-2">{data.bPitch}</td>
                                         <td className="px-6 py-2">{data.cPitch}</td>
                                         <td className="px-6 py-2">{data.bladeThickness}</td>
                                         <td className="px-6 py-2 text-right">
                                             <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 </div>
                )}

                {activeTab === 'registration' && (
                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        자재코드
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        입고수량(PCS)
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        입고 중량(kg)
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrationData.map((data, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {data.materialCode}
                                        </th>
                                        <td className="px-6 py-2">{data.incomingQuantity}</td>
                                        <td className="px-6 py-2">{data.incomingWeight}</td>
                                        <td className="px-6 py-2 text-right">
                                            <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'specification' && (
                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        품명
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        사양코드
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        End-bar
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        품목종류
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        폭(mm)
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        길이(mm)
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        CB수
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        LEP(mm)
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        REP(mm)
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        중량(kg)
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        NE 중량(kg)
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        <span className="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {specificationData.map((data, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {data.itemName}
                                        </th>
                                        <td className="px-6 py-2">{data.specCode}</td>
                                        <td className="px-6 py-2">{data.endBar}</td>
                                        <td className="px-6 py-2">{data.itemType}</td>
                                        <td className="px-6 py-2">{data.width}</td>
                                        <td className="px-6 py-2">{data.length}</td>
                                        <td className="px-6 py-2">{data.cbCount}</td>
                                        <td className="px-6 py-2">{data.lep}</td>
                                        <td className="px-6 py-2">{data.rep}</td>
                                        <td className="px-6 py-2">{data.weight}</td>
                                        <td className="px-6 py-2">{data.neWeight}</td>
                                        <td className="px-6 py-2 text-right">
                                            <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 항상 하단에 고정된 버튼 그룹 */}
            <div className="flex justify-end space-x-4 p-4">
                <button className="bg-transparent border border-gray-700  bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">취소</button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">적용</button>
            </div>
        </div>
    );
};

export default MaterialStandardSetup;
