import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

/**
 * 예시: 패널 데이터 -> 3D Mesh 리스트
 */
function My3DGratingScene({ data }) {
  /**
   * 패널 데이터를 3D Mesh로 변환
   * useMemo를 써서 data가 바뀔 때만 계산
   */
  const meshes = useMemo(() => {
    if (!data) return null;

    // 1) 패널 목록
    const panels = data.result ? data.result.table : data.table;
    if (!panels || !Array.isArray(panels)) return null;

    // 메쉬들을 담을 배열
    const result = [];

    // 패널을 순회하면서, 각 패널의 슬릇(slot)들을 3D Box로 만든다고 가정
    let panelYOffset = 0; // 패널 간 세로 오프셋(씬에서 y좌표 이동용)

    panels.forEach((panel, panelIndex) => {
      if (!panel.gratings_data || panel.gratings_data.length === 0) {
        return;
      }

      // 2) lCuttingNumber 기준으로 그룹화 (슬롯)
      const slotMap = {};
      panel.gratings_data.forEach((g) => {
        const slotKey = g.lCuttingNumber;
        if (!slotMap[slotKey]) {
          slotMap[slotKey] = [];
        }
        slotMap[slotKey].push(g);
      });
      const slots = Object.values(slotMap);

      // "이 패널의 최대 높이" (2D 코드에서 panelMaxHeight)
      const panelMaxHeight = computePanelMaxHeight(slots);

      // 슬롯별로 3D Box 생성
      slots.forEach((slot) => {
        // slot 배열의 첫 그레이팅 기준
        const first = slot[0];
        const leftCut = first.leftCut;
        const rightCut = first.rightCut;

        // 가정) x 길이 = rightCut - leftCut
        const slotWidthX = (rightCut - leftCut) - 10; // 양 옆 5씩 빼는 로직이 있었으니 -10 정도
        // 가정) 높이(세로) = 결합 슬롯이면 sum(width_mm) + 25*(개수-1)
        // 단일 슬롯이면 width_mm
        const slotHeightY = computeSlotHeight(slot);

        // 두께(thickness)는 원하는 만큼. 예: 10mm
        const thicknessZ = 10;

        // (x, y) 위치 잡기
        // 예: leftCut과 panelYOffset 기반
        // Three.js 공간에서
        //   x: leftCut + 절반(= slotWidthX / 2)
        //   y: panelYOffset + slotHeightY/2
        //   z: 0
        // 이런 식으로 중심을 맞출 수 있음
        const centerX = 50 + leftCut + slotWidthX / 2;
        const centerY = panelYOffset + slotHeightY / 2;
        const centerZ = 0;

        // 메쉬 생성
        // geometry: BoxGeometry(가로, 세로, 두께)
        // material: MeshStandardMaterial 등
        // key는 React에서 필요
        result.push(
          <mesh
            key={`panel-${panelIndex}-slot-${first.lCuttingNumber}-${Math.random()}`}
            position={[centerX, centerY, centerZ]}
          >
            <boxGeometry args={[slotWidthX, slotHeightY, thicknessZ]} />
            <meshStandardMaterial color="#7F7FFF" metalness={0.3} roughness={0.6} />
          </mesh>
        );

        // 추가로 크로스바나, L절단선 등 다른 요소들도
        // 필요하다면 별도 <mesh> 또는 <line> 등으로 생성 가능
        // ...
      });

      // 패널 간 Y 간격
      panelYOffset += panelMaxHeight + 200;
    });

    return result;
  }, [data]);

  return (
    <Canvas
      style={{ width: "100%", height: "600px", background: "#f0f0f0" }}
      camera={{ position: [0, 1000, 1500], fov: 50 }} // 카메라 위치 조정
    >
      {/* 조명(빛) 설정 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 500, 1000]} intensity={0.8} />

      {/* 3D Scene 컨트롤(마우스 드래그로 회전/줌 등) */}
      <OrbitControls makeDefault />

      {/* 계산된 메쉬들 렌더링 */}
      {meshes}
    </Canvas>
  );
}

/**
 * "슬롯의 총 높이" 계산
 * - 단일 슬롯: width_mm
 * - 결합 슬롯: sum(width_mm) + 25*(개수-1)
 */
function computeSlotHeight(slot) {
  if (!slot || slot.length === 0) return 0;
  if (slot.length === 1) {
    return slot[0].width_mm;
  } else {
    let total = 0;
    slot.forEach((g) => {
      total += g.width_mm;
    });
    total += 25 * (slot.length - 1);
    return total;
  }
}

/**
 * 패널의 최대 높이(2D 코드를 참조)
 */
function computePanelMaxHeight(slots) {
  let maxHeight = 0;
  slots.forEach((slot) => {
    const h = computeSlotHeight(slot);
    if (h > maxHeight) maxHeight = h;
  });
  return maxHeight;
}

export default My3DGratingScene;
