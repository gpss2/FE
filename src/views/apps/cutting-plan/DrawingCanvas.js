import React from 'react';

const DrawingCanvas = ({ data }) => {
  if (!data) return null;
  const panels = data.result ? data.result.table : data.table;
  if (!Array.isArray(panels)) return null;

  const scaleFactor = 0.13;

  const computeSlotHeight = (slot) => {
    if (slot.length === 1) return slot[0].width_mm;
    let total = 0;
    slot.forEach((g) => {
      total += g.width_mm;
    });
    total += 25 * (slot.length - 1);
    return total;
  };

  const renderPanel = (panel, panelIndex) => {
    const slotMap = {};
    panel.gratings_data.forEach((g) => {
      const slotKey = g.lCuttingNumber;
      if (!slotMap[slotKey]) {
        slotMap[slotKey] = [];
      }
      slotMap[slotKey].push(g);
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
        const rectStyle = {
          position: 'absolute',
          left: leftX + 'px',
          top: (50 + currentOffset) * scaleFactor + 'px',
          width: rightX - leftX + 'px',
          height: w * scaleFactor + 'px',
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
            key={`${panelIndex}-slot-${first.lCuttingNumber}-${idx}`}
            style={rectStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {grating.id}
          </div>,
        );
        currentOffset += w + 25;
      });
    });

    const panelStyle = {
      position: 'relative',
      width: 6200 * scaleFactor + 'px',
      height: (panelMaxHeight + 100) * scaleFactor + 'px',
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
