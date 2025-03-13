import React from 'react';

const DrawingCanvas = ({ data }) => {
  if (!data) return null;
  const panels = data.result ? data.result.table : data.table;
  if (!Array.isArray(panels)) return null;

  // 6200px의 내부 좌표계를 화면에 축소하기 위한 스케일 팩터 (예: 0.13 → 약 800px 폭)
  const scaleFactor = 0.13;

  // 슬롯 높이 계산 (단일 슬롯: width_mm, 결합 슬롯: 각 width_mm 합 + 25*(슬롯 개수-1))
  const computeSlotHeight = (slot) => {
    if (slot.length === 1) return slot[0].width_mm;
    let total = 0;
    slot.forEach((g) => {
      total += g.width_mm;
    });
    total += 25 * (slot.length - 1);
    return total;
  };

  // 패널을 DOM 요소로 변환해 렌더링하는 함수
  const renderPanel = (panel, panelIndex) => {
    // lCuttingNumber 기준으로 슬롯 그룹화
    const slotMap = {};
    panel.gratings_data.forEach((g) => {
      const slotKey = g.lCuttingNumber;
      if (!slotMap[slotKey]) {
        slotMap[slotKey] = [];
      }
      slotMap[slotKey].push(g);
    });
    const slots = Object.values(slotMap);

    // 패널 내 최대 높이 계산
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
      // 원래 좌표에서 50px 여백 후 leftCut+5, rightCut-5 적용하고 스케일 팩터 적용
      const leftX = (50 + leftCut + 5) * scaleFactor;
      const rightX = (50 + rightCut - 5) * scaleFactor;
      let currentOffset = 0;
      slot.forEach((grating, idx) => {
        const w = grating.width_mm;
        const rectStyle = {
          position: 'absolute',
          left: leftX + 'px',
          top: (50 + currentOffset) * scaleFactor + 'px',
          width: rightX - leftX + 'px',
          height: w * scaleFactor + 'px',
          backgroundColor: '#7F7FFF',
          border: '1px solid #000',
          boxSizing: 'border-box',
          // 3D 효과를 위해 더 강한 기울기 적용
          transform: 'rotateX(25deg)',
          transformOrigin: 'top left',
          transition: 'transform 0.3s ease, background-color 0.3s ease',
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
            key={`${panelIndex}-slot-${first.lCuttingNumber}-${idx}`}
            style={rectStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />,
        );
        currentOffset += w + 25;
      });
    });

    // 패널 컨테이너 (내부 좌표계 6200px를 스케일 팩터로 축소)
    const panelStyle = {
      position: 'relative',
      width: 6200 * scaleFactor + 'px',
      height: (panelMaxHeight + 100) * scaleFactor + 'px',
      marginBottom: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
      background:
        'repeating-linear-gradient(45deg, #e5e5e5, #e5e5e5 5px, #bfbfbf 5px, #bfbfbf 10px)',
      // 패널 자체에 3D 기울기 적용
      transform: 'rotateX(25deg)',
      transformOrigin: 'top left',
    };

    // 컨테이너에 perspective 적용해서 3D 효과 극대화
    const containerStyle = {
      perspective: '1000px',
      marginBottom: '20px',
    };

    return (
      <div key={`panel-${panelIndex}`} style={containerStyle}>
        <div style={panelStyle}>{slotElements}</div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '20px' }}>
      {panels.map((panel, idx) => renderPanel(panel, idx))}
    </div>
  );
};

export default DrawingCanvas;
