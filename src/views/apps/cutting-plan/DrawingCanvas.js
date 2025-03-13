import React, { useRef, useEffect } from 'react';

const DrawingCanvas = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log('Received data:', data);
    if (!data) return;

    // 1) panel 배열 꺼내기 (data.result.table 또는 data.table)
    const panels = data.result ? data.result.table : data.table;
    if (!panels || !Array.isArray(panels)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 내부 캔버스 해상도 (파이썬 코드와 동일)
    const canvasWidth = 6200;
    // 여러 패널을 한 번에 그리려면 높이를 넉넉하게 잡거나, 동적으로 계산
    const canvasHeight = 5000; // 예: 5000 픽셀 (패널 개수 많으면 조정)
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ColorWhite = '#FFFFFF';
    const ColorBlack = '#000000';
    const ColorBlue = '#7F7FFF';
    ctx.fillStyle = ColorWhite;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 판(Panel) 간 세로 간격
    const panelSpacing = 200;
    // 각 패널의 상단 여백
    let currentPanelTop = 50;

    panels.forEach((panel, panelIndex) => {
      // 2) lCuttingNumber로 그룹화 → "슬롯" 복원
      const slotMap = {};
      panel.gratings_data.forEach((g) => {
        const slotKey = g.lCuttingNumber;
        if (!slotMap[slotKey]) {
          slotMap[slotKey] = [];
        }
        slotMap[slotKey].push(g);
      });
      // 슬롯 목록
      const slots = Object.values(slotMap);

      // "슬롯들 중 최대 높이"를 구해서, 그 높이를 panel 전체 높이로 사용
      const panelMaxHeight = computePanelMaxHeight(slots);

      // === 슬롯별로 그리기 ===
      slots.forEach((slot) => {
        // slot 내 첫 그레이팅
        const firstGrating = slot[0];
        const leftCut = firstGrating.leftCut;
        const rightCut = firstGrating.rightCut;
        const leftWeld = firstGrating.leftWeld;
        const rightWeld = firstGrating.rightWeld;

        // [LeftMargin + leftCut + 5, currentPanelTop, ...] 계산
        const leftX = 50 + leftCut + 5;
        const rightX = 50 + rightCut - 5;

        // 슬롯이 결합(IsCombined)인지 → slot.length > 1이면 결합
        if (slot.length === 1) {
          // 단일 슬롯
          const singleWidth = slot[0].width_mm;
          // rectangle: (leftX, currentPanelTop) ~ (rightX, currentPanelTop + singleWidth)
          ctx.fillStyle = ColorBlue;
          ctx.fillRect(leftX, currentPanelTop, rightX - leftX, singleWidth);
          ctx.strokeStyle = ColorBlack;
          ctx.lineWidth = 2;
          ctx.strokeRect(leftX, currentPanelTop, rightX - leftX, singleWidth);
        } else {
          // 결합 슬롯
          let bby = 0; // 파이썬 코드: BBY = 0
          slot.forEach((grating, idx) => {
            const w = grating.width_mm;
            // rectangle: (leftX, currentPanelTop + bby) ~ (rightX, currentPanelTop + bby + w)
            ctx.fillStyle = ColorBlue;
            ctx.fillRect(leftX, currentPanelTop + bby, rightX - leftX, w);
            ctx.strokeStyle = ColorBlack;
            ctx.lineWidth = 2;
            ctx.strokeRect(leftX, currentPanelTop + bby, rightX - leftX, w);

            // bby += grating.width_mm + 25
            bby += w + 25;
          });
        }

        // 크로스바(수직선) 그리기
        // 파이썬은 LeftWeldingPoint~RightWeldingPoint에서 100mm 간격
        if (leftWeld !== undefined && rightWeld !== undefined) {
          let weldX = leftWeld;
          while (weldX < rightWeld) {
            ctx.beginPath();
            ctx.moveTo(50 + weldX, currentPanelTop);
            ctx.lineTo(50 + weldX, currentPanelTop + panelMaxHeight);
            ctx.strokeStyle = ColorBlack;
            ctx.lineWidth = 5;
            ctx.stroke();
            weldX += 100;
          }
          // 마지막 선
          ctx.beginPath();
          ctx.moveTo(50 + rightWeld, currentPanelTop);
          ctx.lineTo(50 + rightWeld, currentPanelTop + panelMaxHeight);
          ctx.stroke();
        }

        // L 절단 선(흰색) → leftCut, rightCut
        ctx.beginPath();
        ctx.moveTo(50 + leftCut, currentPanelTop);
        ctx.lineTo(50 + leftCut, currentPanelTop + panelMaxHeight);
        ctx.strokeStyle = ColorWhite;
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(50 + rightCut, currentPanelTop);
        ctx.lineTo(50 + rightCut, currentPanelTop + panelMaxHeight);
        ctx.strokeStyle = ColorWhite;
        ctx.lineWidth = 5;
        ctx.stroke();
      });

      // 베어링 바(수평선) → 파이썬은 0 ~ PanelWidth, 30 간격
      // 여기서는 panelMaxHeight 사용
      for (let y = currentPanelTop; y < currentPanelTop + panelMaxHeight; y += 30) {
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(50 + 6100, y);
        ctx.strokeStyle = ColorBlack;
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      // 다음 패널로 넘어가기 전에 currentPanelTop 업데이트
      currentPanelTop += panelMaxHeight + panelSpacing;
    });
  }, [data]);

  // "결합 슬롯"이면 widths를 모두 합하고 사이 간격(25*(N-1))을 더해서 최대값 판단
  function computePanelMaxHeight(slots) {
    let maxHeight = 0;
    slots.forEach((slot) => {
      if (slot.length === 1) {
        // 단일 슬롯 높이 = width_mm
        const h = slot[0].width_mm;
        if (h > maxHeight) maxHeight = h;
      } else {
        // 결합 슬롯 높이 = sum(width_mm) + 25*(개수-1)
        let total = 0;
        slot.forEach((g) => {
          total += g.width_mm;
        });
        total += 25 * (slot.length - 1);
        if (total > maxHeight) maxHeight = total;
      }
    });
    return maxHeight;
  }

  // 내부 해상도는 (6200 x 5000)이지만, 화면에는 축소해서 표시
  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '1px solid #000',
        // 가로 폭을 1/10로 축소(620px), 세로는 비율 유지(auto)
        width: '1000px',
        height: 'auto',
      }}
    />
  );
};

export default DrawingCanvas;
