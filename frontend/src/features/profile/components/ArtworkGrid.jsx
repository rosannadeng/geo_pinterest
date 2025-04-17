import React from "react";
import { Row, Col } from "antd";
import ArtworkCard from "../../../common/ArtworkCard";


const ArtworkGrid = ({ artworks }) => {
  return (
    <Row gutter={[16, 16]}>
      {artworks.map((artwork) => (
        <Col xs={24} sm={12} md={8} lg={6} key={artwork.id}>
          <ArtworkCard artwork={artwork} style={{height:'200px'}}/>
        </Col>
      ))}
    </Row>
  );
};

export default ArtworkGrid;
