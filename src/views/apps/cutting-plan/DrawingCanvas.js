import React from 'react';

const DrawingCanvas = ({ data }) => {
  if (!data) return null;
  const panels = data.result ? data.result.table : data.table;
  if (!Array.isArray(panels)) return null;

  const scaleFactor = 0.13;

  // --- 수정된 부분 1: 수량(item_qty)을 반영한 높이 계산 ---
  const computeSlotHeight = (slot) => {
    let totalHeight = 0;
    let totalItems = 0;
    
    // 슬롯에 있는 모든 그레이팅의 실제 개수와 높이를 합산합니다.
    slot.forEach((g) => {
      totalHeight += g.width_mm * g.item_qty;
      totalItems += g.item_qty;
    });
    
    // 아이템들 사이의 간격(25)을 더해줍니다.
    if (totalItems > 1) {
      totalHeight += 25 * (totalItems - 1);
    }
    
    return totalHeight;
  };

  const renderPanel = (panel, panelIndex) => {
    const slotMap = {};
    let panelMaxWidth = 0;

    panel.gratings_data.forEach((g) => {
      const slotKey = g.lCuttingNumber;
      if (!slotMap[slotKey]) {
        slotMap[slotKey] = [];
      }
      slotMap[slotKey].push(g);

      if (g.rightCut > panelMaxWidth) {
        panelMaxWidth = g.rightCut;
      }
    });
    const slots = Object.values(slotMap);

    let panelMaxHeight = 0;
    slots.forEach((slot) => {
      const h = computeSlotHeight(slot);
      if (h > panelMaxHeight) panelMaxHeight = h;
    });

    const slotElements = [];
    slots.forEach((slot) => {
      const first = slot[0];
      const leftCut = first.leftCut;
      const rightCut = first.rightCut;
      const leftX = (50 + leftCut + 5) * scaleFactor;
      const rightX = (50 + rightCut - 5) * scaleFactor;
      let currentOffset = 0;
      
      slot.forEach((grating, idx) => {
        const w = grating.width_mm;

        // --- 수정된 부분 2: item_qty 만큼 반복 렌더링 ---
        for (let i = 0; i < grating.item_qty; i++) {
          const rectStyle = {
            position: 'absolute',
            left: `${leftX}px`,
            top: `${(50 + currentOffset) * scaleFactor}px`,
            width: `${rightX - leftX}px`,
            height: `${w * scaleFactor}px`,
            backgroundColor: '#7F7FFF',
            border: '1px solid #000',
            boxSizing: 'border-box',
            transform: 'rotateX(25deg)',
            transformOrigin: 'top left',
            transition: 'transform 0.3s ease, background-color 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff',
          };

          const handleMouseEnter = (e) => {
            e.currentTarget.style.transform = 'rotateX(0deg) translateY(-5px)';
            e.currentTarget.style.backgroundColor = '#FFA500';
          };
          const handleMouseLeave = (e) => {
            e.currentTarget.style.transform = 'rotateX(25deg)';
            e.currentTarget.style.backgroundColor = '#7F7FFF';
          };

          slotElements.push(
            <div
              // React가 각 요소를 구별할 수 있도록 반복 인덱스 'i'를 key에 추가합니다.
              key={`${panelIndex}-slot-${first.lCuttingNumber}-${idx}-${i}`}
              style={rectStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {grating.id}
            </div>,
          );
          
          // 다음 아이템이 올 위치를 계산하기 위해 offset을 증가시킵니다.
          currentOffset += w + 25;
        }
      });
    });

    const panelStyle = {
      position: 'relative',
      width: `${(panelMaxWidth + 100) * scaleFactor}px`,
      height: `${(panelMaxHeight + 100) * scaleFactor}px`,
      marginBottom: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
      background:
        'repeating-linear-gradient(45deg, #e5e5e5, #e5e5e5 5px, #bfbfbf 5px, #bfbfbf 10px)',
      transform: 'rotateX(25deg)',
      transformOrigin: 'top left',
    };

    const containerStyle = {
      perspective: '1000px',
      marginBottom: '20px',
    };

    return (
      <div key={`panel-${panelIndex}`} style={containerStyle}>
        <h1 style={{ textAlign: 'left' }}>판번호: {panel.panelNumber}</h1>
        <div style={panelStyle}>{slotElements}</div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '100px' }}>
      {panels.map((panel, idx) => renderPanel(panel, idx))}
    </div>
  );
};

export default DrawingCanvas;