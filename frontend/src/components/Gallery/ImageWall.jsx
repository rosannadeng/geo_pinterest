import React from 'react';
import { Image } from 'antd';
import VirtualList from 'rc-virtual-list';

const ImageWall = ({ images = [] }) => {
  return (
    <VirtualList
      data={images}
      height={400}
      itemHeight={200}
      itemKey="id"
    >
      {(item) => (
        <Image
          src={item.image}
          alt={item.title}
          style={{ width: '100%', marginBottom: 8 }}
          preview={false}
        />
      )}
    </VirtualList>
  );
};

export default ImageWall; 