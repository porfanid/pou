"use client";
import React, { useEffect, useState } from "react";
import { Carousel, Modal, Button } from "react-bootstrap";
import { getFirebaseStorageUrlFull } from "../../../systems/UploadSystem/articleData/articleData";
import { get, orderByChild, query, ref } from "firebase/database";
import { database } from "../../components/firebase";

const PrimaryCarousel = ({ customSettings, classNameImages, shouldBeFull }) => {
    const [images, setImages] = useState([]);
    const [fullImages, setFullImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapshot = await get(query(ref(database, "/gigs"), orderByChild("thumbnail")));
                const data = snapshot.val();
                const imagePaths = Object.keys(data).map(itemKey => `/gigs/${itemKey}/${data[itemKey].thumbnail}`);

                const imageUrls = await Promise.all(
                    imagePaths.map(imagePath => getFirebaseStorageUrlFull(imagePath, !!shouldBeFull))
                );
                setImages(imageUrls);

                if (!shouldBeFull) {
                    const fullImageUrls = await Promise.all(
                        imagePaths.map(imagePath => getFirebaseStorageUrlFull(imagePath, true))
                    );
                    setFullImages(fullImageUrls);
                }
            } catch (error) {
                console.error("Error fetching images:", error);
            }
        };

        fetchData();
    }, [shouldBeFull]);

    const settings = {
        controls: true,
        indicators: true,
        interval: 4000,
        pause: "hover",
        ...customSettings,
    };

    const handleImageClick = (index) => {
        setSelectedImage(fullImages[index]);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedImage(null);
    };

    return (
        <div>
            {images.length > 0 && (
                <Carousel {...settings}>
                    {images.map((image, index) => (
                        <Carousel.Item key={index} onClick={() => handleImageClick(index)}>
                            <img
                                src={image}
                                alt={`slide${index}`}
                                style={{ width: "100%", height: "auto" }}
                            />
                        </Carousel.Item>
                    ))}
                </Carousel>
            )}

            <Modal size="lg" show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Image Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <img
                        src={selectedImage}
                        alt="Selected"
                        style={{ width: "100%", height: "auto" }}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PrimaryCarousel;
