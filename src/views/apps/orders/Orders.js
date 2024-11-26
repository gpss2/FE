import React from 'react';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { Grid, Box, Button, Stack, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
const columnsLeft = [
    { field: 'taskNumber', headerName: '태스크번호', width: 130 },
    { field: 'orderNumber', headerName: '수주번호', width: 130 },
    { field: 'surfaceTreatment', headerName: '표면처리', width: 100 },
    { field: 'coatingThickness', headerName: '도금 두께', width: 100 },
    { field: 'remarks', headerName: '특기사항', width: 100 },
    { field: 'category', headerName: '구분', width: 100 },
    { field: 'orderDate', headerName: '수주일자', width: 100 },
    { field: 'customerCode', headerName: '수주처 코드', width: 100 },
    { field: 'deliveryDate', headerName: '납기일자', width: 100 },
];

const rowsLeft = [
    { id: 1, taskNumber: '19990915-T18', orderNumber: '199908-080Y', surfaceTreatment: 'GALV', coatingThickness: 53.0, remarks: 'none', category: '토목', orderDate: '1999/08/27', customerCode: 'SHI', deliveryDate: '1999/08/31' },
    { id: 2, taskNumber: '19991006-T09', orderNumber: '199910-013Y', surfaceTreatment: 'GALV', coatingThickness: 53.0, remarks: 'none', category: '플랜트', orderDate: '1999/10/05', customerCode: 'DL', deliveryDate: '1999/10/15' },
    { id: 3, taskNumber: '19991023-T11', orderNumber: '199910-039K', surfaceTreatment: 'GALV', coatingThickness: 85.0, remarks: 'none', category: '플랜트', orderDate: '1999/10/13', customerCode: 'KH', deliveryDate: '1999/10/22' },
    { id: 4, taskNumber: '19991023-T04', orderNumber: '19991020-468', surfaceTreatment: 'GALV', coatingThickness: 53.0, remarks: 'none', category: '일본토목', orderDate: '1999/10/20', customerCode: 'JK', deliveryDate: '1999/11/05' },
    { id: 5, taskNumber: '20230324-T01', orderNumber: '2303-029.030', surfaceTreatment: 'GALV', coatingThickness: 75.0, remarks: '없음', category: '플랜트', orderDate: '2023/03/23', customerCode: '상상인', deliveryDate: '2023/04/27' },
    { id: 6, taskNumber: '19991102-T08', orderNumber: '991101-498', surfaceTreatment: 'GALV', coatingThickness: 53.0, remarks: 'none', category: '플랜트', orderDate: '1999/11/01', customerCode: 'HWM', deliveryDate: '1999/11/12' },
    { id: 7, taskNumber: '20190123-T01', orderNumber: 'A1901-017', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2019/01/23', customerCode: 'DTS KI', deliveryDate: '2019/02/15' },
    { id: 8, taskNumber: '20190307-T02', orderNumber: 'A1903-097', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2019/03/07', customerCode: 'ISHIDA', deliveryDate: '2019/03/28' },
    { id: 9, taskNumber: '20190313-T03', orderNumber: 'A1903-104', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2019/03/13', customerCode: 'Doosa', deliveryDate: '2019/03/29' },
    { id: 10, taskNumber: '20190510-T01', orderNumber: 'A1905-186', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2019/05/10', customerCode: 'DTS KI', deliveryDate: '2019/05/30' },
    { id: 11, taskNumber: '20190628-T04', orderNumber: 'A1906-301', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2019/06/28', customerCode: 'PSS', deliveryDate: '2019/07/20' },
    { id: 12, taskNumber: '20190821-T01', orderNumber: 'A1908-321', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2019/08/21', customerCode: 'SJD', deliveryDate: '2019/08/30' },
    { id: 13, taskNumber: '20190823-T04', orderNumber: 'A1908-338', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2019/08/23', customerCode: 'SJD', deliveryDate: '2019/09/06' },
    { id: 14, taskNumber: '20191008-T03', orderNumber: 'A1910-421', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2019/10/08', customerCode: 'DTS KI', deliveryDate: '2019/10/28' },
    { id: 15, taskNumber: '20200325-T01', orderNumber: 'A2003-097', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2020/03/25', customerCode: 'NEPEA', deliveryDate: '2020/04/17' },
    { id: 16, taskNumber: '20200414-T03', orderNumber: 'A2009-325', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2020/04/14', customerCode: 'PSV', deliveryDate: '2020/05/06' },
    { id: 17, taskNumber: '20200516-T01', orderNumber: 'A2005-345', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2020/05/16', customerCode: 'PSS', deliveryDate: '2020/06/10' },
    { id: 18, taskNumber: '20200915-T02', orderNumber: 'A2009-346', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2020/09/15', customerCode: 'PSS', deliveryDate: '2020/09/30' },
    { id: 19, taskNumber: '20200916-T01', orderNumber: 'A2009-347', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2020/09/16', customerCode: 'PSS', deliveryDate: '2020/10/05' },
    { id: 20, taskNumber: '20201006-T02', orderNumber: 'A2010-348', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2020/10/06', customerCode: 'PSS', deliveryDate: '2020/10/25' },
    { id: 21, taskNumber: '20201008-T03', orderNumber: 'A2010-349', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2020/10/08', customerCode: 'PSS', deliveryDate: '2020/10/29' },
    { id: 22, taskNumber: '20201009-T01', orderNumber: 'A2010-350', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2020/10/09', customerCode: 'PSS', deliveryDate: '2020/11/05' },
    { id: 23, taskNumber: '20201010-T01', orderNumber: 'A2010-351', surfaceTreatment: 'GALV', coatingThickness: 86.0, remarks: '없음', category: '플랜트', orderDate: '2020/10/10', customerCode: 'PSS', deliveryDate: '2020/11/06' },
    { id: 24, taskNumber: '20210707-T02', orderNumber: 'A2107-000', surfaceTreatment: 'GALV', coatingThickness: 75.0, remarks: '없음', category: '플랜트', orderDate: '2021/07/07', customerCode: '카타르', deliveryDate: '2021/08/25' },
];


const columnsRight = [
    { field: 'customerCode', headerName: '수주처 코드', width: 100 },
    { field: 'customerName', headerName: '수주처명', flex: 1 },
];

const rowsRight = [
    { id: 1, customerCode: 'TOYO', customerName: 'TOYO KANETSU' },
    { id: 2, customerCode: '(유)부강', customerName: '(유)부강' },
    { id: 3, customerCode: '(유)엠텍', customerName: '(유)엠텍' },
    { id: 4, customerCode: '(유)유심', customerName: '(유)유심' },
    { id: 5, customerCode: '(유)태신', customerName: '(유)태신' },
    { id: 6, customerCode: '(주)KHPT', customerName: '(주)KHPT' },
    { id: 7, customerCode: '(주)거흥', customerName: '(주)거흥산업' },
    { id: 8, customerCode: '(주)달성', customerName: '(주)달성' },
    { id: 9, customerCode: '(주)도고', customerName: '(주)도고산업' },
    { id: 10, customerCode: '(주)보성', customerName: '(주)보성' },
    { id: 11, customerCode: '(주)삼탑', customerName: '(주)삼탑엔지니어링' },
    { id: 12, customerCode: '(주)석영', customerName: '(주)석영' },
    { id: 13, customerCode: '(주)성현', customerName: '(주)성현' },
    { id: 14, customerCode: '(주)세양', customerName: '(주)세양기업' },
    { id: 15, customerCode: '(주)에이', customerName: '(주)에이테크' },
    { id: 16, customerCode: '(주)우신', customerName: '(주)우신시스템' },
    { id: 17, customerCode: '(주)우영', customerName: '(주)우영미엔지' },
    { id: 18, customerCode: '(주)웰크', customerName: '(주)웰크로강업' },
    { id: 19, customerCode: '(주)유림', customerName: '(주)유림미엔씨' },
];

const Orders = () => {
    return (
        <div>
            <PageContainer title="수주 목록 입력">
                <Grid container spacing={2}>
                    {/* Left Table */}
                    <Grid item lg={9} xs={12} mt={3}>
                        <ParentCard title="수주 목록 관리">
                            <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                                <DataGrid
                                    rows={rowsLeft}
                                    columns={columnsLeft}
                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 20]}
                                    pagination
                                    checkboxSelection
                                    rowHeight={30}
                                    sx={{
                                        '& .MuiDataGrid-columnHeaders': {
                                            height: 30,
                                        },
                                    }}
                                />
                            </Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                                {/* 프린트 버튼 */}
                                <Stack direction="row" spacing={1}>
                                    <IconButton color="primary" aria-label="print"
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'primary.main',
                                            borderRadius: 1,
                                        }}>
                                        <PrintIcon />
                                    </IconButton>
                                    <IconButton
                                        color="primary"
                                        aria-label="add"
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'primary.main',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Stack>
                                {/* 삭제 및 저장 버튼 */}
                                <Stack direction="row" spacing={1}>
                                    <IconButton color="warning" aria-label="delete" sx={{
                                        border: '1px solid',
                                        borderColor: 'primary.warning',
                                        borderRadius: 1,
                                    }}>
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton color="primary" aria-label="save" sx={{
                                        border: '1px solid',
                                        borderColor: 'primary.main',
                                        borderRadius: 1,
                                    }}>
                                        <SaveIcon />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </ParentCard>
                    </Grid>

                    {/* Right Table */}
                    <Grid item lg={3} xs={12} mt={3}>
                        <ParentCard title="수주처 코드 관리">
                            <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                                <DataGrid
                                    rows={rowsRight}
                                    columns={columnsRight}
                                    pageSize={5}
                                    checkboxSelection
                                    rowsPerPageOptions={[5, 10, 20]}
                                    pagination
                                    rowHeight={30}
                                    sx={{
                                        '& .MuiDataGrid-columnHeaders': {
                                            height: 30,
                                        },
                                    }}
                                />

                            </Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                                {/* 추가 버튼 */}
                                <IconButton
                                    color="primary"
                                    aria-label="add"
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'primary.main',
                                        borderRadius: 1,
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>

                                {/* 삭제 및 저장 버튼 */}
                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        color="warning"
                                        aria-label="delete"
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'warning.main', // warning.main으로 수정
                                            borderRadius: 1,
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton
                                        color="primary"
                                        aria-label="save"
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'primary.main',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <SaveIcon />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        </ParentCard>
                    </Grid>
                </Grid>
            </PageContainer>
        </div>
    );
};

export default Orders;
