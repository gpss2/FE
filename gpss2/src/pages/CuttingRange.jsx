import React, { useState } from 'react';
const CuttingRange = () => {
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

  return (
    <div className="h-[70vh] flex flex-col space-y-4">
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
  );
};

export default CuttingRange;
