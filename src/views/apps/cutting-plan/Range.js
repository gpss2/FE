import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, Stack, Button } from '@mui/material';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';

const topColumns = [
    { field: 'orderNumber', headerName: '수주번호', flex: 1 },
    { field: 'taskList', headerName: '제작사양 목록', flex: 2 },
    { field: 'type', headerName: '구분', flex: 1 },
    { field: 'orderDate', headerName: '수주일자', flex: 1 },
    { field: 'clientName', headerName: '수주처명', flex: 1 },
    { field: 'deliveryDate', headerName: '납기일자', flex: 1 },
    { field: 'totalQuantity', headerName: '총수량', flex: 1 },
    { field: 'totalWeight', headerName: '총중량(Kg)', flex: 1 },
    { field: 'taskNumber', headerName: '태스크번호', flex: 1 },
];

const bottomColumns = [
    { field: 'itemId', headerName: '품목 ID', flex: 2 },
    { field: 'drawingNumber', headerName: '도면번호', flex: 1 },
    { field: 'itemNumber', headerName: '품목번호', flex: 1 },
    { field: 'itemType', headerName: '품목종류', flex: 1 },
    { field: 'itemName', headerName: '품명', flex: 2 },
    { field: 'specCode', headerName: '사양코드', flex: 1 },
    { field: 'endBar', headerName: 'EndBar', flex: 1 },
    { field: 'width', headerName: '폭(mm)', flex: 1 },
    { field: 'length', headerName: '길이(mm)', flex: 1 },
    { field: 'cbCount', headerName: 'CB 수', flex: 1 },
    { field: 'lep', headerName: 'LEP(mm)', flex: 1 },
    { field: 'rep', headerName: 'REP(mm)', flex: 1 },
    { field: 'quantity', headerName: '수량', flex: 1 },
    { field: 'weight', headerName: '중량(Kg)', flex: 2 },
    { field: 'groupNumber', headerName: '그룹번호', flex: 1 },
];

const dummyTopData = [
    {
        id: 1,
        orderNumber: 'KP2005-022A',
        taskList: 'MS-F032050-044 / MS-F032050-610',
        type: '플랜트',
        orderDate: '2020/05/22',
        clientName: '(주)부광',
        deliveryDate: '2020/06/08',
        totalQuantity: 66,
        totalWeight: 599.1,
        taskNumber: '20200522-T02',
    },
    {
        id: 2,
        orderNumber: 'KP2005-022B',
        taskList: 'MS-F032050-050 / MS-F032050-620',
        type: '플랜트',
        orderDate: '2020/05/21',
        clientName: '(주)부광',
        deliveryDate: '2020/06/08',
        totalQuantity: 44,
        totalWeight: 443.2,
        taskNumber: '20200521-T02',
    },
];

const dummyBottomData = {
    1: [
        {
            id: 1,
            itemId: 'KP2005-022A-0021',
            drawingNumber: '02',
            itemNumber: '01',
            itemType: 'R',
            itemName: 'Steel Grating',
            specCode: 'MS-F032050-044',
            endBar: 'F032050-610',
            width: 785,
            length: 2760,
            cbCount: 27,
            lep: 66.0,
            rep: 94.0,
            quantity: 1,
            weight: 101.5,
            groupNumber: '20200522-G002',
        },
        {
            id: 2,
            itemId: 'KP2005-022A-0022',
            drawingNumber: '02',
            itemNumber: '02',
            itemType: 'R',
            itemName: 'Steel Grating',
            specCode: 'MS-F032050-044',
            endBar: 'F032050-610',
            width: 995,
            length: 2851,
            cbCount: 22,
            lep: 85.0,
            rep: 85.0,
            quantity: 1,
            weight: 132.0,
            groupNumber: '20200522-G002',
        },
    ],
    2: [
        {
            id: 1,
            itemId: 'KP2005-022B-0021',
            drawingNumber: '01',
            itemNumber: '01',
            itemType: 'R',
            itemName: 'Steel Grating B',
            specCode: 'MS-F032050-050',
            endBar: 'F032050-620',
            width: 500,
            length: 2000,
            cbCount: 20,
            lep: 60.0,
            rep: 70.0,
            quantity: 1,
            weight: 80.0,
            groupNumber: '20200521-G001',
        },
    ],
};

const Range = () => {
    const [bottomData, setBottomData] = useState([]);

    const handleRowClick = (params) => {
        const selectedOrderId = params.id;
        setBottomData(dummyBottomData[selectedOrderId] || []);
    };

    const handleMerge = () => {
        console.log('병합 버튼 클릭됨');
        // 병합 관련 로직 추가
    };

    const handleSplit = () => {
        console.log('분리 버튼 클릭됨');
        // 분리 관련 로직 추가
    };

    return (
        <div>
            <PageContainer title="계획 범위 지정">
                <Grid container spacing={2}>
                    {/* 상단 테이블 */}
                    <Grid item xs={12} mt={3}>
                        <ParentCard title="태스크범위 지정 화면">
                            <Box sx={{ height: 300, width: '100%' }}>
                                <DataGrid
                                    rows={dummyTopData}
                                    columns={topColumns}
                                    pageSize={5}
                                    onRowClick={handleRowClick}
                                    rowHeight={30}
                                    rowsPerPageOptions={[5, 10]}
                                    sx={{
                                        '& .MuiDataGrid-columnHeaders': {
                                            height: 60,
                                            backgroundColor: '#f0f0f0',
                                            color: '#333',
                                        },
                                    }}
                                />
                            </Box>
                        </ParentCard>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    {/* 하단 테이블 */}
                    <Grid item xs={12} mt={3}>
                        <ParentCard title="그룹범위 지정 화면">
                            <Box sx={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    rows={bottomData}
                                    columns={bottomColumns}
                                    pageSize={5}
                                    checkboxSelection // 체크박스 추가
                                    rowHeight={30}
                                    rowsPerPageOptions={[5, 10]}
                                    sx={{
                                        '& .MuiDataGrid-columnHeaders': {
                                            height: 60,
                                            backgroundColor: '#f0f0f0',
                                            color: '#333',
                                        },
                                    }}
                                />
                            </Box>
                            <Stack direction="row" justifyContent="flex-end" alignItems="center" mt={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleMerge}
                                    sx={{ marginRight: '10px' }}
                                >
                                    병합
                                </Button>
                                <Button variant="contained" color="secondary" onClick={handleSplit}>
                                    분리
                                </Button>
                            </Stack>
                        </ParentCard>
                    </Grid>
                </Grid>
            </PageContainer>
        </div>
    );
};

export default Range;
