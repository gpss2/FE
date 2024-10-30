import React from 'react';
import BlogDetail from 'src/components/apps/blog/detail/BlogDetail';

import PageContainer from '../../../components/container/PageContainer';

const BlogPost = () => {
  return (
    <PageContainer title="Blog" description="this is Blog page">
      {/* ------------------------------------------- */}
      {/* Blog Listing */}
      {/* ------------------------------------------- */}
      <BlogDetail />
    </PageContainer>
  );
};

export default BlogPost;
