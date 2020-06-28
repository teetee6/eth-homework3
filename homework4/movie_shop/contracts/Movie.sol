pragma solidity >=0.4.0 <=0.6.0;
// pragma experimental ABIEncoderV2;

contract Movie {

    struct Review {
        // uint id;
        address publisher;
        string movie_reviews;
    }

    mapping(uint => Review) public reviews;
    uint public reviewsCount;

    event reviewEvent (    );

    function addReview(string memory sentence) public {
        // Review memory review = Review(msg.sender, sentence);
        // reviews[total_review] = review;
        reviewsCount++;

        reviews[reviewsCount].publisher = msg.sender;
        reviews[reviewsCount].movie_reviews = sentence;
        emit reviewEvent();
    }

//


    int[30] public movie_claps;

    mapping(address => bool) public clapper;

    uint public total_claps = 0;

    event clapEvent (
        uint indexed _movieId
    );

    function clap(uint _movieId) public {
        // require that they haven't clapped before
        require(!clapper[msg.sender]);

        // record that clapper has clapped
        clapper[msg.sender] = true;

        // add the count of clap to each movie
        movie_claps[_movieId]++;
        total_claps++;

        emit clapEvent(_movieId);
    }

    function getClaps() public view returns (int[30] memory) {
        return movie_claps;
    }
}