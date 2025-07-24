import React from 'react';
import { IconButton } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

/**
 * 테이블 내용을 인쇄하는 버튼 컴포넌트
 * @param {object} props
 * @param {React.RefObject} props.targetRef - 인쇄할 테이블을 감싸는 요소의 ref
 * @param {string} [props.title='Print'] - 인쇄 페이지의 제목
 */
const PrintButton = ({ targetRef, title = 'Print' }) => {
  const handlePrint = () => {
    const elementToPrint = targetRef.current;
    if (!elementToPrint) {
      console.error("인쇄 실패: 인쇄할 대상을 찾을 수 없습니다.");
      alert("인쇄할 대상을 찾을 수 없습니다.");
      return;
    }

    const table = elementToPrint.querySelector('table');
    if (!table) {
      console.error("인쇄 실패: 대상 내부에서 테이블을 찾을 수 없습니다.");
      alert("인쇄할 테이블을 찾을 수 없습니다.");
      return;
    }

    const tableHtml = table.outerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${title} 인쇄</title>
          <style>
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            body { 
              font-family: 'Malgun Gothic', sans-serif; 
              margin: 20px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              table-layout: fixed; 
            }
            th, td { 
              border: 1px solid black; 
              padding: 8px; 
              text-align: center; 
              overflow-wrap: break-word;
            }
            th { 
              background-color: #B2B2B2 !important; 
              font-size: 14px; 
              font-weight: bold;
              white-space: pre-wrap; 
              line-height: 1.2; 
            }
            td { 
              font-size: 12px; 
            }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          ${tableHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <IconButton
      color="secondary"
      sx={{
        border: '1px solid',
        borderColor: 'secondary.main',
        borderRadius: 1,
      }}
      onClick={handlePrint}
    >
      <PrintIcon />
    </IconButton>
  );
};

export default PrintButton;
