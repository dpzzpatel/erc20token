App={
    web3Provider:null,
    contracts:{},
    account:'0x0',
    loading:false,
    tokenPrice:1000000000000000,
    tokensSold:0,
    tokensAvailable:750000,
    init:function(){
        console.log("App initialized...");
        return App.initWeb3();
    },
    initWeb3:async function(){
        if(window.ethereum){
            //if a web3 instance is already provided by Meta Mask.
            App.web3Provider =  window.ethereum;
            web3 = new Web3(window.ethereum);
            console.log('ok');
        } else{
            //Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
            console.log('ok1');
        }
        return App.initContracts();
    },

    initContracts:function(){
        $.getJSON("DappTokenSale.json",function(dappTokenSale){
          App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
          App.contracts.DappTokenSale.setProvider(App.web3Provider);
          App.contracts.DappTokenSale.deployed().then(function(dappTokenSale){
          console.log("Dapp Token Sale Address:",dappTokenSale.address);
          });
        }).done(function(){
            $.getJSON("DappToken.json",function(dappToken){
            App.contracts.DappToken = TruffleContract(dappToken);
            App.contracts.DappToken.setProvider(App.web3Provider);
            App.contracts.DappToken.deployed().then((dappToken)=>{
                console.log("Dapp Token Contract Address:",dappToken.address);
            });
            return App.render();
          });
        });
    },

    render:function(){
        if(App.loading){
            return;
        }
        App.loading = true;

        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();

        //Load Account Data
        if(window.ethereum)
            ethereum.enable();
        App.account = window.ethereum.selectedAddress;
        $('#accountAddress').html("Your Account Address:"+App.account);
        
        window.ethereum.on('accountsChanged',(accounts)=> {
            App.account = accounts;
            console.log('Current acccount:'+accounts)
        });
        // web3.eth.getCoinbase((err,account)=>{
        //     if(err===null){
        //         App.account = account;
        //         $('#accountAddress').html("Your Account Address:"+account);
        //     }
        //     });

        App.loading = false;
        loader.hide();
        content.show();


        //Load Token Sale Contract
        App.contracts.DappTokenSale.deployed().then((instance)=>{
            dappTokenSaleInstance = instance;
            return dappTokenSaleInstance.tokenPrice();
        }).then((tokenPrice)=>{
                App.tokenPrice = tokenPrice;
                $('.token-price').html(web3.utils.fromWei(App.tokenPrice,"ether"));
                return dappTokenSaleInstance.tokensSold();
            }).then((tokensSold)=>{
                App.tokensSold = tokensSold.toNumber();
                $('.tokens-sold').html(App.tokensSold);
                $('.tokens-available').html(App.tokensAvailable);
                var progressPercent = (App.tokensSold / App.tokensAvailable)*100;
                $('#progress').css('width',progressPercent+'%');
            //Load Token Contract
            App.contracts.DappToken.deployed().then((instance)=>{
                dappTokenInstance = instance;
                return dappTokenInstance.balanceOf(App.account);
            }).then((balance)=>{
                $('.dapp-balance').html(balance.toNumber());
                App.loading = false;
                loader.hide();
                content.show();
            });
        });
    },

    buyTokens:function(){
        console.log('buying tokens...');
        $('#content').hide();
        $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        App.contracts.DappTokenSale.deployed().then((instance)=>{
            return instance.buyTokens(numberOfTokens,{
                from:App.account,
                value:numberOfTokens*App.tokenPrice,
                gas:500000
            }).then((result)=>{
                console.log("Tokens Bought....");
                $('form').trigger('reset');
                $('#loader').hide();
                $('#content').show();
            })
        })
    }
}

$(function(){
    $(window).on('load',function(){
        App.init();
    })
})