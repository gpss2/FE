import React, { useState } from 'react';

const OrderListEntry = () => {
  // 수주 목록 더미 데이터
  const [orderData, setOrderData] = useState(
    Array(40).fill({
      taskNo: '-',       // 태스크 번호
      orderNo: '-',      // 수주번호
      surfaceTreatment: '-', // 표면처리
      platingThickness: '-', // 도금 두께
      specialNotes: '-', // 특기사항
      type: '-',         // 구분
      orderDate: '-',    // 수주일자
      clientCode: '-',   // 수주처 코드
      deliveryDate: '-'  // 납기 일자
    })
  );

  const [clientData, setClientData] = useState(
    Array(40).fill({
      clientCode: '-',  // 수주처 코드
      clientName: '-'   // 수주처 명
    })
  );

  const [activeTab, setActiveTab] = useState('orderList'); // 기본 탭 설정

  return (
    <div className="p-4 min-h-[88vh] flex flex-col">
      {/* Tabs 메뉴 */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`pb-2 text-lg ${activeTab === 'orderList'
            ? 'border-b-2 border-blue-500 text-blue-500'
            : 'text-gray-600'
            }`}
          onClick={() => setActiveTab('orderList')}
        >
          <b>수주 목록</b>
        </button>
      </div>

      {/* Tab에 따른 컨텐츠 */}
      <div className="flex-grow">
        {activeTab === 'orderList' && (
          <div className="p-4 h-[70vh] flex flex-col space-y-4">
            <div className="grid grid-cols-[7fr,3fr] gap-8">
              {/* 첫 번째 테이블: 수주 목록 테이블 */}
              <div className="relative overflow-y-auto h-[65vh] shadow-md sm:rounded-lg" >
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-2">태스크 번호</th>
                      <th scope="col" className="px-6 py-2">수주번호</th>
                      <th scope="col" className="px-6 py-2">표면처리</th>
                      <th scope="col" className="px-6 py-2">도금 두께</th>
                      <th scope="col" className="px-6 py-2">특기사항</th>
                      <th scope="col" className="px-6 py-2">구분</th>
                      <th scope="col" className="px-6 py-2">수주일자</th>
                      <th scope="col" className="px-6 py-2">수주처 코드</th>
                      <th scope="col" className="px-6 py-2">납기 일자</th>
                      <th scope="col" className="px-6 py-2">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.map((data, index) => (
                      <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <th scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {data.taskNo}
                        </th>
                        <td className="px-6 py-2">{data.orderNo}</td>
                        <td className="px-6 py-2">{data.surfaceTreatment}</td>
                        <td className="px-6 py-2">{data.platingThickness}</td>
                        <td className="px-6 py-2">{data.specialNotes}</td>
                        <td className="px-6 py-2">{data.type}</td>
                        <td className="px-6 py-2">{data.orderDate}</td>
                        <td className="px-6 py-2">{data.clientCode}</td>
                        <td className="px-6 py-2">{data.deliveryDate}</td>
                        <td className="px-6 py-2 text-right">
                          <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 두 번째 테이블: 수주처 정보 테이블 */}
              <div className="relative overflow-y-auto h-[65vh] shadow-md sm:rounded-lg" >
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-2">수주처 코드</th>
                      <th scope="col" className="px-6 py-2">수주처 명</th>
                      <th scope="col" className="px-6 py-2">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientData.map((data, index) => (
                      <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <th scope="row" className="px-6 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {data.clientCode}
                        </th>
                        <td className="px-6 py-2">{data.clientName}</td>
                        <td className="px-6 py-2 text-right">
                          <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 항상 하단에 고정된 버튼 그룹 */}
      <div className="flex justify-end space-x-4 p-4">
        <button className="bg-transparent border border-gray-700 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">취소</button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">적용</button>
      </div>
    </div>
  );
};

export default OrderListEntry;
