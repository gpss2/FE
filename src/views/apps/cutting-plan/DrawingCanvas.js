import React from 'react';

const DrawingCanvas = ({ data }) => {
  // 데이터가 없거나 table 속성이 없으면 렌더링 중단
  if (!data || !data.table) return null;

  // --- 데이터 구조 정규화 ---
  // 데이터가 중첩 구조(그룹)이든 단일 구조이든,
  // 렌더링할 패널의 목록을 하나의 배열(flatListOfPanels)로 통일합니다.
  const flatListOfPanels = [];
  data.table.forEach(item => {
    // 중첩된 데이터 구조인 경우 (item이 group 객체일 때)
    if (item.result && Array.isArray(item.result.table)) {
      item.result.table.forEach(panel => flatListOfPanels.push(panel));
    } 
    // 단일 데이터 구조인 경우 (item이 panel 객체일 때)
    else if (item.panelNumber) {
      flatListOfPanels.push(item);
    }
  });

  // 렌더링할 패널이 없으면 여기서 중단
  if (flatListOfPanels.length === 0) return null;

  const scaleFactor = 0.13;

  const computeSlotHeight = (slot) => {
    let totalHeight = 0;
    let totalItems = 0;
    
    slot.forEach((g) => {
      totalHeight += g.width_mm * g.item_qty;
      totalItems += g.item_qty;
    });
    
    if (totalItems > 1) {
      totalHeight += 25 * (totalItems - 1);
    }
    
    return totalHeight;
  };

  const renderPanel = (panel, panelIndex, copyIndex) => {
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
    slots.forEach((slot, slotIdx) => {
      const first = slot[0];
      const leftCut = first.leftCut;
      const rightCut = first.rightCut;
      const leftX = (50 + leftCut + 5) * scaleFactor;
      const rightX = (50 + rightCut - 5) * scaleFactor;
      let currentOffset = 0;
      
      slot.forEach((grating, gratingIdx) => {
        const w = grating.width_mm;

        for (let i = 0; i < (grating.item_qty || 1); i++) {
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
              key={`p-${panelIndex}-c-${copyIndex}-s-${slotIdx}-g-${gratingIdx}-i-${i}`}
              style={rectStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {grating.id}
            </div>,
          );
          
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
      <div key={`panel-container-${panelIndex}-copy-${copyIndex}`} style={containerStyle}>
        <h1 style={{ textAlign: 'left' }}>
          판번호: {panel.panelNumber} {panel.qty > 1 ? `(${copyIndex + 1}/${panel.qty})` : ''}
        </h1>
        <div style={panelStyle}>{slotElements}</div>
      </div>
    );
  };

  const allPanelsToRender = [];
  // 정제된 패널 목록(flatListOfPanels)을 순회하여 렌더링
  flatListOfPanels.forEach((panel, panelIdx) => {
      // 각 패널의 'qty' 값만큼 for문을 돌면서 렌더링할 컴포넌트를 배열에 추가
      for (let i = 0; i < (panel.qty || 1); i++) {
          allPanelsToRender.push(renderPanel(panel, panelIdx, i));
      }
  });

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '100px' }}>
      {allPanelsToRender}
    </div>
  );
};

export default DrawingCanvas;