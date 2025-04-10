import React from "react";
import { Row, Col, Card, Image } from "antd";
import ArtworkCard from "../../../common/ArtworkCard";

const ArtworkGrid = ({ artworks }) => {
  return (
    <Row gutter={[16, 16]}>
      {artworks.map((artwork) => (
        <Col xs={24} sm={12} md={8} lg={6} key={artwork.id}>
          <Card
            hoverable
            cover={
              <Image
                alt={artwork.title}
                src={artwork.image}
                style={{ height: '200px', objectFit: 'cover' }}
              />
            }
          >
            <Card.Meta
              title={artwork.title}
              description={artwork.description}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ArtworkGrid;
