import React, { useState } from 'react';
import CuttingRange from './CuttingRange';
import CuttingInProgress from './CuttingInProgress';

const CuttingCondition = () => {
  // 수주 정보 더미 데이터
  const [orders, setOrders] = useState(
    Array(10).fill({
      taskNo: '-',       // 태스크 번호
      orderNo: '-',      // 수주번호
      orderType: '-',    // 구분
      orderDate: '-',    // 수주일자
      clientName: '-',   // 수주처명
      deliveryDate: '-', // 납기일자
      totalQuantity: '-',// 총수량
      totalWeight: '-'   // 총중량(Kg)
    })
  );
  const [activeTab, setActiveTab] = useState('standard'); // 기본 탭 설정

  // 품목 정보 더미 데이터
  const [items, setItems] = useState(
    Array(10).fill({
      itemId: '-',
      itemName: '-',
      endBar: '-',
      width: '-',
      length: '-',
      cbCount: '-',
      lep: '-',
      rep: '-',
      weight: '-',
      neWeight: '-'
    })
  );
  const [ordersRange, setOrdersRange] = useState(
    Array(10).fill({
      orderNo: '19072-T01',       // 수주번호
      specList: 'Spec-01',        // 제작사양 목록
      orderType: 'Type A',        // 구분
      orderDate: '2024-10-01',    // 수주일자
      clientName: 'Client XYZ',   // 수주처명
      deliveryDate: '2024-11-01', // 납기일자
      totalQuantity: '100',       // 총수량
      totalWeight: '500 Kg',      // 총중량(Kg)
      taskNo: 'T001'              // 태스크 번호
    })
  );

  // 품목 정보 더미 데이터
  const [itemsRange, setItemsRange] = useState(
    Array(10).fill({
      itemId: 'A001',             // 품목ID
      drawingNo: 'DR-1234',       // 도면 번호
      itemNo: 'Item-001',         // 품목번호
      itemType: 'Type-B',         // 품목종류
      itemName: 'Product X',      // 품명
      specCode: 'SP-987',         // 사양코드
      endBar: 'EB-01',            // Endbar
      width: '200 mm',            // 폭(mm)
      length: '500 mm',           // 길이(mm)
      cbCount: '50',              // CB수
      lep: '5 mm',                // LEP폭(mm)
      rep: '5 mm',                // REP폭(mm)
      quantity: '300',            // 수량
      weight: '100 Kg',           // 중량(kg)
      groupNo: 'G-01'             // 그룹번호
    })
  );
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
          <b>조건 입력</b>
        </button>
        <button
          className={`pb-2 text-lg ${activeTab === 'registration'
            ? 'border-b-2 border-blue-500 text-blue-500'
            : 'text-gray-600'
            }`}
          onClick={() => setActiveTab('registration')}
        >
          <b>계획범위 지정</b>
        </button>
        <button
          className={`pb-2 text-lg ${activeTab === 'specification'
            ? 'border-b-2 border-blue-500 text-blue-500'
            : 'text-gray-600'
            }`}
          onClick={() => setActiveTab('specification')}
        >
          <b>작업중인 계획 보기</b>
        </button>
      </div>

      {/* Tab에 따른 컨텐츠 */}
      <div className="flex-grow">
        {activeTab === 'standard' && (
          <div className="p-4 h-[70vh] flex flex-col space-y-4">
            {/* 상단 영역: 수주 정보 테이블 */}
            <div className="flex-grow h-2/5 relative overflow-y-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3">태스크 번호</th>
                    <th scope="col" className="px-6 py-3">수주번호</th>
                    <th scope="col" className="px-6 py-3">구분</th>
                    <th scope="col" className="px-6 py-3">수주일자</th>
                    <th scope="col" className="px-6 py-3">수주처명</th>
                    <th scope="col" className="px-6 py-3">납기일자</th>
                    <th scope="col" className="px-6 py-3">총수량</th>
                    <th scope="col" className="px-6 py-3">총중량(Kg)</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {orders.map((order, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <th scope="row" className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {order.taskNo}
                      </th>
                      <td className="px-2 py-2">{order.orderNo}</td>
                      <td className="px-2 py-2">{order.orderType}</td>
                      <td className="px-2 py-2">{order.orderDate}</td>
                      <td className="px-2 py-2">{order.clientName}</td>
                      <td className="px-2 py-2">{order.deliveryDate}</td>
                      <td className="px-2 py-2">{order.totalQuantity}</td>
                      <td className="px-2 py-2">{order.totalWeight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 하단 영역: 품목 정보 테이블 */}
            <div className="flex-grow h-3/5 relative overflow-y-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3">품목ID</th>
                    <th scope="col" className="px-6 py-3">품명</th>
                    <th scope="col" className="px-6 py-3">EndBar</th>
                    <th scope="col" className="px-6 py-3">폭(mm)</th>
                    <th scope="col" className="px-6 py-3">길이(mm)</th>
                    <th scope="col" className="px-6 py-3">CB수</th>
                    <th scope="col" className="px-6 py-3">LEP(mm)</th>
                    <th scope="col" className="px-6 py-3">REP(mm)</th>
                    <th scope="col" className="px-6 py-3">중량(kg)</th>
                    <th scope="col" className="px-6 py-3">NE 중량(kg)</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {items.map((item, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <th scope="row" className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item.itemId}
                      </th>
                      <td className="px-2 py-2">{item.itemName}</td>
                      <td className="px-2 py-2">{item.endBar}</td>
                      <td className="px-2 py-2">{item.width}</td>
                      <td className="px-2 py-2">{item.length}</td>
                      <td className="px-2 py-2">{item.cbCount}</td>
                      <td className="px-2 py-2">{item.lep}</td>
                      <td className="px-2 py-2">{item.rep}</td>
                      <td className="px-2 py-2">{item.weight}</td>
                      <td className="px-2 py-2">{item.neWeight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'registration' && (
          <div className="p-4 h-[70vh] flex flex-col space-y-4">
            {/* 상단 영역: 수주 정보 테이블 */}
            <div className="flex-grow h-2/5 relative overflow-y-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3">수주번호</th>
                    <th scope="col" className="px-6 py-3">제작사양 목록</th>
                    <th scope="col" className="px-6 py-3">구분</th>
                    <th scope="col" className="px-6 py-3">수주일자</th>
                    <th scope="col" className="px-6 py-3">수주처명</th>
                    <th scope="col" className="px-6 py-3">납기일자</th>
                    <th scope="col" className="px-6 py-3">총수량</th>
                    <th scope="col" className="px-6 py-3">총중량(Kg)</th>
                    <th scope="col" className="px-6 py-3">태스크 번호</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {orders.map((order, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <th scope="row" className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {order.orderNo}
                      </th>
                      <td className="px-2 py-2">{order.specList}</td>
                      <td className="px-2 py-2">{order.orderType}</td>
                      <td className="px-2 py-2">{order.orderDate}</td>
                      <td className="px-2 py-2">{order.clientName}</td>
                      <td className="px-2 py-2">{order.deliveryDate}</td>
                      <td className="px-2 py-2">{order.totalQuantity}</td>
                      <td className="px-2 py-2">{order.totalWeight}</td>
                      <td className="px-2 py-2">{order.taskNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end space-x-4">
              <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">병합</button>
              <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">분리</button>
              <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">편집 확인</button>
              <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">초기화면</button>
              <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">Print</button>

            </div>
            <div className="flex-grow h-3/5 relative overflow-y-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-3">품목ID</th>
                    <th scope="col" className="px-6 py-3">도면 번호</th>
                    <th scope="col" className="px-6 py-3">품목번호</th>
                    <th scope="col" className="px-6 py-3">품목종류</th>
                    <th scope="col" className="px-6 py-3">품명</th>
                    <th scope="col" className="px-6 py-3">사양코드</th>
                    <th scope="col" className="px-6 py-3">Endbar</th>
                    <th scope="col" className="px-6 py-3">폭(mm)</th>
                    <th scope="col" className="px-6 py-3">길이(mm)</th>
                    <th scope="col" className="px-6 py-3">CB수</th>
                    <th scope="col" className="px-6 py-3">LEP폭(mm)</th>
                    <th scope="col" className="px-6 py-3">REP폭(mm)</th>
                    <th scope="col" className="px-6 py-3">수량</th>
                    <th scope="col" className="px-6 py-3">중량(kg)</th>
                    <th scope="col" className="px-6 py-3">그룹번호</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {items.map((item, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <th scope="row" className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {item.itemId}
                      </th>
                      <td className="px-2 py-2">{item.drawingNo}</td>
                      <td className="px-2 py-2">{item.itemNo}</td>
                      <td className="px-2 py-2">{item.itemType}</td>
                      <td className="px-2 py-2">{item.itemName}</td>
                      <td className="px-2 py-2">{item.specCode}</td>
                      <td className="px-2 py-2">{item.endBar}</td>
                      <td className="px-2 py-2">{item.width}</td>
                      <td className="px-2 py-2">{item.length}</td>
                      <td className="px-2 py-2">{item.cbCount}</td>
                      <td className="px-2 py-2">{item.lep}</td>
                      <td className="px-2 py-2">{item.rep}</td>
                      <td className="px-2 py-2">{item.quantity}</td>
                      <td className="px-2 py-2">{item.weight}</td>
                      <td className="px-2 py-2">{item.groupNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'specification' && (
          <div>
              <CuttingInProgress />
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

export default CuttingCondition;
