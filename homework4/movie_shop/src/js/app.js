App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Movie.json', function(movie) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Movie = TruffleContract(movie);
      // Connect provider to interact with contract
      App.contracts.Movie.setProvider(App.web3Provider);

      console.log('거점입니다');
      App.render();
      App.listenForEvents();
      App.listenForReviewEvents();
      App.AddReviewButton();
      App.changeClap();
    });
    

  },

  pressClap: function() {
    // event.preventDefault();
    var movieId = parseInt($(event.target).data('id'));
    var movieInstance;

    web3.eth.getCoinbase(function(err, account) {
      if(err=== null) {
        App.account = account;
      }
    });

    App.contracts.Movie.deployed().then(function(instance) {
      movieInstance = instance;
      return movieInstance.clap(movieId, { from: App.account});
    }).then(function(result) {
      $("#loader").hide();
      $("#moviesRow").show();
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  changeClap: function() {
    var movieInstance;

    App.contracts.Movie.deployed().then(function(instance) {
      movieInstance = instance;

      return movieInstance.getClaps.call();
    }).then(function(movies_claps) {
      for (i=0; i< 30; i++) {
        if( movies_claps[i] != 0) {
          console.log(i, '번째 나 호출되용~~ >>>', movies_claps[i].toNumber())
        }
      }
    })
  },

  listenForEvents: function () {

    App.contracts.Movie.deployed().then(function(instance) {
      instance.clapEvent({}, {
        fromBlock: 0,
        toBlock: "latest"
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },
  
  listenForReviewEvents: function () {
    
    App.contracts.Movie.deployed().then(function(instance) {
      instance.reviewEvent({}, {
        fromBlock: 0,
        toBlock: "latest"
      }).watch(function(error, event) {
        console.log("review event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    var loader = $("#loader");
    var content = $("#moviesRow");
    var postTemplate = $('#postTemplate');
    postTemplate.hide();
    loader.show();
    content.hide();

    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    App.contracts.Movie.deployed().then(function(instance) {
      movieInstance = instance;
      return movieInstance.total_claps();
    }).then(function(total_claps) {

      var moviewsResults = $("#moviesRow");
      moviewsResults.empty();

      if(total_claps != 0 ) {
        movieInstance.getClaps.call().then( function(movies_claps) {
          console.log('여기에요111')
          $.getJSON('../movies.json', function(data) {
            var moviesRow = $('#moviesRow');
            var movieTemplate = $('#movieTemplate');
  
            for (i = 0; i < data.length; i ++) {
              movieTemplate.find('.panel-title').text(data[i].name);
              movieTemplate.find('img').attr('src', data[i].picture);
              movieTemplate.find('.movie-genre').text(data[i].genre);
              movieTemplate.find('.movie-runtime').text(data[i].runtime);
              movieTemplate.find('.movie-release_date').text(data[i].release_date);
              movieTemplate.find('.btn-clap').attr('data-id', data[i].id);
              // movieTemplate.find('.movie-clap_times').text(   $('movie-clap_times').eq(i).val()   );
              // movieTemplate.find('.movie-clap_times').text(   $('.panel-movie').eq(i).find('.movie-clap_times').val()   );
              movieTemplate.find('.movie-clap_times').text(  movies_claps[i].toNumber() + '   (' + (movies_claps[i].toNumber()/total_claps) * 100 + '%)');
              moviesRow.append(movieTemplate.html());
            }  
          });
        })
      

      } else {
        console.log('여기에요222')

        $.getJSON('../movies.json', function(data) {
          var moviesRow = $('#moviesRow');
          var movieTemplate = $('#movieTemplate');

          for (i = 0; i < data.length; i ++) {
            movieTemplate.find('.panel-title').text(data[i].name);
            movieTemplate.find('img').attr('src', data[i].picture);
            movieTemplate.find('.movie-genre').text(data[i].genre);
            movieTemplate.find('.movie-runtime').text(data[i].runtime);
            movieTemplate.find('.movie-release_date').text(data[i].release_date);
            movieTemplate.find('.btn-clap').attr('data-id', data[i].id);
            movieTemplate.find('.movie-clap_times').text(0);
            moviesRow.append(movieTemplate.html());
          }
        });
      }
      
    })

    
    
    loader.hide();
    content.show();

  },

  AddReviewButton: function() {
    $(document).on('click', '.addNews', App.AddReviews);
  },

  
  AddReviews:function(event){
    var review = document.getElementById('post').value
    var reviewInstance;
    App.contracts.Movie.deployed().then(function(instance){
      reviewInstance = instance;
      return reviewInstance.addReview(review);
    }); 
    console.log("review posted");
  },

  reviewRender: function() {
    // var movieId = parseInt($(event.target).data('id'));

    var loader = $("#loader");
    var content = $("#moviesRow");

    loader.show();
    content.hide();

    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });


    App.contracts.Movie.deployed().then( async function(instance) {
      movieInstance = instance;
      return movieInstance.reviewsCount();
    }).then(function (result) {
      var moviesRow = $('#moviesRow');
      moviesRow.empty();
      var addreview = $('#add-review');
      addreview.show();

      var counts = result.c[0];
      console.log("Total Reviews : "+counts);
        for (var i=1; i<= counts; i++) {
          movieInstance.reviews(i).then(function(review) {
            console.log("Publisher Address:" +review[0]);
            console.log("News:" +review[1]);

            var postTemplate = $('#postTemplate');

            postTemplate.find('.panel-title').text(review[0]);
            postTemplate.find('.desc').text(review[1]);
            moviesRow.append(postTemplate.html());
          });
        }
    });
    loader.hide();
    content.show();

  },
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
