import React from "react";
import Link from "next/link";

const ReadMore = ({articles}) => {

    return (
        <div className="container">
            <h4>Pulse Of The Underground</h4>
            <div className="row mt-4 mb-5 text-center">
                {articles.map((article) => (
                    <div key={article.link} className="col-md-4 mb-4">
                        <div className="card h-100 w-100 bg-dark text-white">
                            <img className="card-img-top shadow-lg img-fluid" src={article.image} alt={article.title} />
                            <div className="card-header">
                                <h3 className="card-title fw-bold">{article.title}</h3>
                            </div>
                            <div className="card-body">
                                <Link href={article.link} className="btn btn-primary">Read More</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReadMore;
