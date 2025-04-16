import React, { useEffect, useState } from 'react';
import { Card, Image } from 'antd';
import ArtworkCard from '../../../common/ArtworkCard';
import './MasonryGrid.css';

const MasonryGrid = ({ artworks, onArtworkClick, onLike }) => {
  const [columns, setColumns] = useState([]);
  const [columnCount, setColumnCount] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumnCount(1);
      } else if (width < 1024) {
        setColumnCount(2);
      } else {
        setColumnCount(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!Array.isArray(artworks)) {
      console.warn("MasonryGrid received non-array artworks:", artworks);
      return;
    }
    const newColumns = Array(columnCount).fill().map(() => []);
    
    artworks.forEach((artwork, index) => {
      const columnIndex = index % columnCount;
      newColumns[columnIndex].push(artwork);
    });

    setColumns(newColumns);
  }, [artworks, columnCount]);

  return (
    <div className="masonry-grid">
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="masonry-column">
          {column.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onClick={() => onArtworkClick(artwork)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid; 