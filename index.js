const cron = require('node-cron');
const axios = require('axios');
const NotificationCenter = require('node-notifier').NotificationCenter;
const notificationCenterNotifier = new NotificationCenter({
  withFallback: true
});
const skus = ["15463567", "15084753", "14950588"]
const BB_URL = "https://www.bestbuy.ca/ecomm-api/availability/products?accept=application%2Fvnd.bestbuy.simpleproduct.v1%2Bjson&accept-language=en-CA&locations=&postalCode=M5V&skus="
const BB_URL2 = "https://www.bestbuy.ca/api/v2/json/product/"

cron.schedule('* * * * *', () => {
  const time = new Date().toLocaleString();
  console.log(`Running ` + time);
  skus.forEach(sku => {
    axios(BB_URL2 + sku + "?currentRegion=ON&lang=en-CA&include=all")
     .catch((error) => {
      console.log(error.toJSON());
      })
      .then(res => {
        if(res.data === undefined){
          console.log("API ERROR")
          return
        }
        const { data } = res
        const name = data.name
        const availability = data.availability.onlineAvailability
        const isAvailableOnline = data.availability.isAvailableOnline
        console.log(`Name: ` + name + `, availability: ` + isAvailableOnline)
        if(isAvailableOnline){
          notificationCenterNotifier.notify({
            title: "AVAILABLE",
            subtitle: "Click to buy",
            message: "RTX3080",
            sound: 'Frog',
            open: "https://www.bestbuy.ca/en-ca/basket",
            wait: true,
          });
        }
        axios(BB_URL + sku)
         .catch((error) => {
          console.log(error.toJSON());
          })
          .then(res => {
            if(res.data === undefined){
              console.log("API ERROR")
              return
            }
            const { data } = res
            const product = data.availabilities[0]
            const pickupAvailable = product.pickup.purchasable
            const shippingAvailable = product.shipping.purchasable
            console.log(`Availability: ` + `pickup=` + pickupAvailable + `, shipping=` + shippingAvailable)
            if(pickupAvailable || shippingAvailable){
              notificationCenterNotifier.notify({
                title: "AVAILABLE",
                subtitle: "Click to buy",
                message: "RTX3080",
                sound: 'Frog',
                open: "https://www.bestbuy.ca/en-ca/basket",
                wait: true,
              });
            }
          })
      })
    

  })
  

 

});
