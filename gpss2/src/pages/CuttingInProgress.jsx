import React, { useState } from 'react';

const CuttingInProgress = () => {
  const dummyData = Array(10).fill({
    taskNo: '-',       // 태스크 번호
    orderNo: '-',      // 수주번호
    orderDate: '-',    // 수주일자
    clientCode: '-',   // 수주처 코드
    productName: '-',  // 품명
    specCode: '-',     // 사양코드
    baseQuantity: '-', // 기본수량
    lTolerance: '-',   // +L 공차
    wTolerance: '-',   // -L 공차
    probability: '-',  // 폭확률
    ioFdLimit: '-'     // IOFD 탐색 제한
  });

  const lowerTableData = Array(10).fill({
    groupNo: '-',        // 그룹번호
    totalPlates: '-',    // 총판수
    bbLoss: '-',         // BB 손실율
    cbLoss: '-',         // CB 손실율
    bbCode: '-',         // BB 코드
    bbUsed: '-',         // BB 사용량
    bbLossAmount: '-',   // BB 손실량
    cbCode: '-',         // CB 코드
    cbUsed: '-',         // CB 사용량
    cbLossAmount: '-'    // CB 손실량
  });

  return (
    <div className="p-4 h-[70vh] flex flex-col space-y-4">
      
      {/* 첫번째 뭉탱이: 4:6 비율로 나눈 두 개의 테이블 */}
      <div className="flex-grow flex space-x-4 h-1/2 w-full">
        {/* 두 테이블을 동일한 부모 컨테이너로 */}
        <div className="w-full grid grid-cols-2 gap-4">
          {/* 첫 번째 테이블: 4/10 비율 */}
          <div className="relative overflow-y-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3">태스크 번호</th>
                  <th scope="col" className="px-6 py-3">수주번호</th>
                  <th scope="col" className="px-6 py-3">수주일자</th>
                  <th scope="col" className="px-6 py-3">수주처 코드</th>
                  <th scope="col" className="px-6 py-3">품명</th>
                  <th scope="col" className="px-6 py-3">사양코드</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {dummyData.map((data, index) => (
                  <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {data.taskNo}
                    </th>
                    <td className="px-2 py-2">{data.orderNo}</td>
                    <td className="px-2 py-2">{data.orderDate}</td>
                    <td className="px-2 py-2">{data.clientCode}</td>
                    <td className="px-2 py-2">{data.productName}</td>
                    <td className="px-2 py-2">{data.specCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 두 번째 테이블: 6/10 비율 */}
          <div className="relative overflow-y-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3">기본수량</th>
                  <th scope="col" className="px-6 py-3">+L 공차</th>
                  <th scope="col" className="px-6 py-3">-L 공차</th>
                  <th scope="col" className="px-6 py-3">폭확률</th>
                  <th scope="col" className="px-6 py-3">IOFD 탐색 제한</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {dummyData.map((data, index) => (
                  <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {data.baseQuantity}
                    </th>
                    <td className="px-2 py-2">{data.lTolerance}</td>
                    <td className="px-2 py-2">{data.wTolerance}</td>
                    <td className="px-2 py-2">{data.probability}</td>
                    <td className="px-2 py-2">{data.ioFdLimit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-4">
              <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">작업지시폼 확인</button>
              <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">품목 배치 자세히</button>
            </div>
      {/* 두번째 뭉탱이: 100% 너비의 테이블 */}
      <div className="flex-grow h-1/2 w-full relative overflow-y-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3">그룹번호</th>
              <th scope="col" className="px-6 py-3">총판수</th>
              <th scope="col" className="px-6 py-3">BB 손실율</th>
              <th scope="col" className="px-6 py-3">CB 손실율</th>
              <th scope="col" className="px-6 py-3">BB 코드</th>
              <th scope="col" className="px-6 py-3">BB 사용량</th>
              <th scope="col" className="px-6 py-3">BB 손실량</th>
              <th scope="col" className="px-6 py-3">CB 코드</th>
              <th scope="col" className="px-6 py-3">CB 사용량</th>
              <th scope="col" className="px-6 py-3">CB 손실량</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {lowerTableData.map((data, index) => (
              <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {data.groupNo}
                </th>
                <td className="px-2 py-2">{data.totalPlates}</td>
                <td className="px-2 py-2">{data.bbLoss}</td>
                <td className="px-2 py-2">{data.cbLoss}</td>
                <td className="px-2 py-2">{data.bbCode}</td>
                <td className="px-2 py-2">{data.bbUsed}</td>
                <td className="px-2 py-2">{data.bbLossAmount}</td>
                <td className="px-2 py-2">{data.cbCode}</td>
                <td className="px-2 py-2">{data.cbUsed}</td>
                <td className="px-2 py-2">{data.cbLossAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CuttingInProgress;
