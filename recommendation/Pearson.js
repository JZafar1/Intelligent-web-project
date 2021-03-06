const _ = require('lodash');

module.exports = class Pearson {

    // Returns the Pearson correlation coefficient for p1 and p2
    static sim(prefs, person1, person2) {

        // Get the list of shared_items
        let personOnePref = _.map(prefs[person1], (n) => {
            return _.keys(n)[0];
        });
        let personTwoPref = _.map(prefs[person2], (n) => {
            return _.keys(n)[0];
        });
        let sharedPrefs = _.intersection(personOnePref, personTwoPref);

        // If they have no ratings in common, return 0
        if (sharedPrefs.length === 0) return 0;

        let sum1 = 0;
        let sum1Sq = 0;
        let sum2 = 0;
        let sum2Sq = 0;
        let pSum = 0;

        _.forEach(sharedPrefs, (value) => {

            let person1Rating = _.values(_.find(prefs[person1], (e) => {
                if (e[value]) return e[value];
            }))[0];
            let person2Rating = _.values(_.find(prefs[person2], (e) => {
                if (e[value]) return e[value];
            }))[0];

            // Add up all the preferences
            sum1 += person1Rating;
            sum2 += person2Rating;

            // Sum up the squares
            sum1Sq += Math.pow(person1Rating, 2);
            sum2Sq += Math.pow(person2Rating, 2);

            // Sum up the products
            pSum += person1Rating * person2Rating;

        });

        let num = pSum - (sum1 * sum2 / sharedPrefs.length);
        let den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / sharedPrefs.length) * (sum2Sq - Math.pow(sum2, 2) / sharedPrefs.length));

        if (den === 0) return 0;

        return num / den;

    }

};
