/**
 * command line interface for the admin
 */


var program = require('commander');
var readPkgUp = require('read-pkg-up');
var chalk = require('chalk');
//var db = require('./db');
var giveaway = require('./giveaway');





program
  .version(readPkgUp.sync().pkg.version)

  
          
program
  .command('create')
  .description('Creates a sweepstakes')
  .option('-t, --title <title>', 'Title of sweepstakes')
  .option('-d, --description <description>', 'Description of sweepstakes')
  .option('-p, --picture <picture>', 'Picture for sweepstakes')
  .option('-s, --sponsor <sponsor>', 'Name of the sweepstakes sponsor')
  .option('-a, --address <address>', 'Address of the sweepstakes')
  .option('-m, --email <email>', 'Sponsor E-mail address')
  .option('-e, --end <end>', 'Date at which entries are cut off')
  .option('-r, --drawing <drawing>', 'Date at which the drawing takes place')
  .action(function(env){
    console.log(env);
    console.log('');
    console.log(chalk.red(env.title));
  
    // make sure required args were received
    !env.title ? console.log(chalk.red('✖') + ' title') : console.log(chalk.green('✔') + ' title')
    !env.description ? console.log(chalk.red('✖') + ' description') : console.log(chalk.green('✔') + ' description')
    !env.picture ? console.log(chalk.red('✖') + ' picture') : console.log(chalk.green('✔') + ' picture')
    !env.sponsor ? console.log(chalk.red('✖') + ' sponsor') : console.log(chalk.green('✔') + ' sponsor')
    !env.address ? console.log(chalk.red('✖') + ' address') : console.log(chalk.green('✔') + ' address')
    !env.email ? console.log(chalk.red('✖') + ' email') : console.log(chalk.green('✔') + ' email')
    !env.end ? console.log(chalk.red('✖') + ' endDate') : console.log(chalk.green('✔') + ' endDate')
    !env.drawing ? console.log(chalk.red('✖') + ' drawingDate') : console.log(chalk.green('✔') + ' drawingDate')
    //env = env || 'all';
    //console.log('setup for %s env(s) with %s mode', env, mode);
    console.log(chalk.bold.green('CREATE') + env.description);
  
    if (env.title &&
        env.description &&
        env.picture &&
        env.sponsor &&
        env.address &&
        env.email &&
        env.end &&
        env.drawing) {
       giveaway.create({
         title: env.title,
         description: env.description,
         picture: env.picture,
         sponsor: env.sponsor,
         address: env.address,
         email: env.email,
         end: env.end,
         drawing: env.drawing
       }, function(err, giveawayID) {
         if (err) throw err;
        console.log('[' + chalk.bold.green('OK') + '] giveaway successfully created with id ' + giveawayID);
       });
    }
  });

// must be before .parse() since
// node's emit() is immediate

program.on('--help', function(){
  console.log('  Usage');
  console.log('    $ low.js <COMMAND>');
});

program.parse(process.argv);


if (!program.args.length) program.help();


//
//var cli = meow([
//'    Usage',
//'      $ luw.js <COMMAND>',
//'',
//'    Options',
//'      --help                           output usage information',
//'      -t, --title <title>              Title of sweepstakes',
//'      -d, --description <description>  Description of sweepstakes',
//'      -p, --picture <picture>          URL to sweepstakes picture',
//'      -s, --sponsor <sponsor>          Name of the sweepstakes sponsor',
//'      -a, --address <address>          Address of the sweepstakes sponsor',
//'      -m, --email <email>              Sponsor E-mail address',
//'      -e, --end <end>                  Date at which entries are cut off',
//'      -r, --drawing <drawing>          Date at which the drawing takes place',
//'',
//'    Examples',
//'      $ luw.js create --title my cool sweepstakes'
//], {





//var vorpal = require('vorpal')();
////var clap = require('tinyclap')();
////var db = require('./db');
//var giveaway = require('./giveaway');
////console.log(clap);
//var minimist = require('minimist');
//
//var argv = minimist(process.argv.slice(2));
//console.log(argv);







//
//var cli = meow([
//'    Usage',
//'      $ luw.js <COMMAND>',
//'',
//'    Options',
//'      --help                           output usage information',
//'      -t, --title <title>              Title of sweepstakes',
//'      -d, --description <description>  Description of sweepstakes',
//'      -p, --picture <picture>          URL to sweepstakes picture',
//'      -s, --sponsor <sponsor>          Name of the sweepstakes sponsor',
//'      -a, --address <address>          Address of the sweepstakes sponsor',
//'      -m, --email <email>              Sponsor E-mail address',
//'      -e, --end <end>                  Date at which entries are cut off',
//'      -r, --drawing <drawing>          Date at which the drawing takes place',
//'',
//'    Examples',
//'      $ luw.js create --title my cool sweepstakes'
//], {
//  alias: {
//    t: 'title',
//    d: 'description',
//    p: 'picture',
//    s: 'sponsor',
//    a: 'address',
//    m: 'email',
//    e: 'endDate',
//    r: 'drawingDate'
//  }
//});


//console.log(cli.input);

//
//var usage = function usage() {
//  console.log('Usage: node luw.js [COMMAND] [arguments]');
//    Usage: create [options]
//
//
//  Creates a sweepstakes
//
//  Options:
//
//    --help                           output usage information
//    -t, --title <title>              Title of sweepstakes
//    -d, --description <description>  Description of sweepstakes
//    -p, --picture <picture>          URL to sweepstakes picture
//    -s, --sponsor <sponsor>          Name of the sweepstakes sponsor
//    -a, --address <address>          Address of the sweepstakes sponsor
//    -m, --email <email>              Sponsor's E-mail address
//    -e, --end <end>                  Date at which entries are cut off
//    -r, --drawing <drawing>          Date at which the drawing takes place
//}
//
//if (typeof(clap.cmd) === 'undefined') {
//  return usage();
//}
//
//
//if (clap.cmd.toLowerCase() == 'create') {
//  // verify args
//  var title = clap.argn[0] || 'Generic Giveaway';
//  var desc = clap.argn[1] || 'Generic Description';
//  var pic = clap.argn[2] || 'https://ipfs.pics/ipfs/Qmah8r8MSVQtWyzTUg4VtFvRqRVv1MpAaGcEfeZiQB57st';
//  
//  giveaway.create(title, desc, pic, function(err) {
//    if (err) throw err;
//    return 
//  });
//  //db.createGiveaway(title, desc, pic);
//  
//}
//
//
//vorpal
//  .command('create', 'Creates a sweepstakes')
//
//  .option('-t, --title <title>', 'Title of sweepstakes')
//  .option('-d, --description <description>', 'Description of sweepstakes')
//  .option('-p, --picture <picture>', 'URL to sweepstakes picture')
//  .option('-s, --sponsor <sponsor>', 'Name of the sweepstakes sponsor')
//  .option('-a, --address <address>', 'Address of the sweepstakes sponsor')
//  .option('-m, --email <email>', 'Sponsor\'s E-mail address')
//  .option('-e, --end <end>', 'Date at which entries are cut off')
//  .option('-r, --drawing <drawing>', 'Date at which the drawing takes place')
//  
//  .action(function(args, cb){
//    this.log(args);
//
//    cb();
//  });
//
//vorpal.show();