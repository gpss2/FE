import {
  IconHome,
  IconPoint,
  IconClipboard,
  IconFileDescription,
  IconBorderAll,
  IconAlertCircle,
  IconSettings,
  IconLogin,
  IconUserPlus,
  IconRotate,
  IconZoomCode,
  IconNotes,
  IconTicket,
  IconApps,
  IconChartDonut3,

} from '@tabler/icons';

import { uniqueId } from 'lodash';

const Menuitems = [

  {
    id: uniqueId(),
    title: '자재',
    icon: IconApps,
    href: '/apps/material/',
    children: [
      {
        id: uniqueId(),
        title: '자재표준 셋업',
        icon: IconPoint,
        href: '/apps/material/setup',
      },
      {
        id: uniqueId(),
        title: '자재입고 등록',
        icon: IconPoint,
        href: '/apps/material/add',
      },
      {
        id: uniqueId(),
        title: '규격품목 셋업',
        icon: IconPoint,
        href: '/apps/material/items',
      },
    ],
  },

  {
    id: uniqueId(),
    title: '수주',
    icon: IconClipboard,
    href: '/apps/orders',
    children: [
      {
        id: uniqueId(),
        title: '수주 목록 입력',
        icon: IconPoint,
        href: '/apps/orders',
      },
    ],
  },
  {
    id: uniqueId(),
    title: '절단 계획',
    icon: IconFileDescription,
    href: '/apps/cutting-plan/',
    children: [
      {
        id: uniqueId(),
        title: '조건 입력',
        icon: IconPoint,
        href: '/apps/cutting-plan/cond',

      },
      {
        id: uniqueId(),
        title: '계획범위 지정',
        icon: IconPoint,
        href: '/apps/cutting-plan/range',
      },
      {
        id: uniqueId(),
        title: '계획 시작 및 잔재 생성',
        icon: IconPoint,
        href: '/apps/cutting-plan/start',
      },
      {
        id: uniqueId(),
        title: '작업중인 계획 보기',
        icon: IconPoint,
        href: '/apps/cutting-plan/work',
      },
    ]

  },
];
export default Menuitems;
