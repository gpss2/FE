import React from 'react';
import { Grid } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import ChildCard from '../../../components/shared/ChildCard';

import DefaultButtons from '../../../components/forms/form-elements/button/DefaultButtons';
import ColorButtons from '../../../components/forms/form-elements/button/ColorButtons';
import IconLoadingButtons from '../../../components/forms/form-elements/button/IconLoadingButtons';
import SizeButton from '../../../components/forms/form-elements/button/SizeButton';

import OutlinedDefaultButtons from '../../../components/forms/form-elements/button/OutlinedDefaultButtons';
import OutlinedIconButtons from '../../../components/forms/form-elements/button/OutlinedIconButtons';
import OutlinedSizeButton from '../../../components/forms/form-elements/button/OutlinedSizeButton';

import TextDefaultButtons from '../../../components/forms/form-elements/button/TextDefaultButtons';
import TextColorButtons from '../../../components/forms/form-elements/button/TextColorButtons';
import TextIconButtons from '../../../components/forms/form-elements/button/TextIconButtons';
import TextSizeButton from '../../../components/forms/form-elements/button/TextSizeButton';

import IconColorButtons from '../../../components/forms/form-elements/button/IconColorButtons';
import IconSizeButtons from '../../../components/forms/form-elements/button/IconSizeButtons';

import FabDefaultButton from '../../../components/forms/form-elements/button/FabDefaultButton';
import FabColorButtons from '../../../components/forms/form-elements/button/FabColorButtons';
import FabSizeButtons from '../../../components/forms/form-elements/button/FabSizeButtons';

import DefaultButtonGroup from '../../../components/forms/form-elements/button/DefaultButtonGroup';
import SizeButtonGroup from '../../../components/forms/form-elements/button/SizeButtonGroup';
import VerticalButtonGroup from '../../../components/forms/form-elements/button/VerticalButtonGroup';
import ColorButtonGroup from '../../../components/forms/form-elements/button/ColorButtonGroup';
import TextButtonGroup from '../../../components/forms/form-elements/button/TextButtonGroup';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Button',
  },
];

const ExButton = () => (
  // 2

  <PageContainer title="Buttons" description="this is Buttons page">
    {/* breadcrumb */}
    <Breadcrumb title="Button" items={BCrumb} />
    {/* end breadcrumb */}
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ParentCard title="Buttons">
          <Grid container spacing={3}>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Default">
                <DefaultButtons />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Colors">
                <ColorButtons />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Loading Buttons">
                <IconLoadingButtons />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Sizes">
                <SizeButton />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Outlined">
                <OutlinedDefaultButtons />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Outlined Icon">
                <OutlinedIconButtons />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Outline Size">
                <OutlinedSizeButton />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Text">
                <TextDefaultButtons />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Text Color">
                <TextColorButtons />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Text Icon">
                <TextIconButtons />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Text Sizes">
                <TextSizeButton />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Icon Color">
                <IconColorButtons />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Icon Sizes">
                <IconSizeButtons />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="FAB">
                <FabDefaultButton />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="FAB Color">
                <FabColorButtons />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="FAB Size">
                <FabSizeButtons />
              </ChildCard>
            </Grid>
          </Grid>
        </ParentCard>
      </Grid>
      <Grid item xs={12}>
        <ParentCard title="Button Group">
          <Grid container spacing={3}>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Default">
                <DefaultButtonGroup />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Sizes">
                <SizeButtonGroup />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Verical">
                <VerticalButtonGroup />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} lg={6} display="flex" alignItems="stretch">
              <ChildCard title="Text">
                <TextButtonGroup />
              </ChildCard>
            </Grid>
            {/* ------------------------- row 1 ------------------------- */}
            <Grid item xs={12} display="flex" alignItems="stretch">
              <ChildCard title="Color">
                <ColorButtonGroup />
              </ChildCard>
            </Grid>
          </Grid>
        </ParentCard>
      </Grid>
    </Grid>
  </PageContainer>
);
export default ExButton;
