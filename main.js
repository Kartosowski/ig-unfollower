import colors from 'colors'
import cliSpinners from 'cli-spinners'
import figlet from 'figlet'
import 'dotenv/config';

const csrftoken = process.env.CSRFTOKEN
const ds_user_id = process.env.DS_USER_ID
const sessionid = process.env.SESSION_ID
const count = process.env.COUNT_TO_UNFOLLOW

var friendly = process.env.SKIP_USER.split(", ");

await figlet("IG-Unfollower", function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data.brightBlue);
});
console.log(" Created by Kartos\n https://github.com/Kartosowski\n")
main()

async function unfollow(id) {
    const unfollow = await fetch("https://www.instagram.com/api/v1/friendships/destroy/"+id+"/", {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "content-type": "application/x-www-form-urlencoded",
          "priority": "u=1, i",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-csrftoken": csrftoken,
          "x-ig-app-id": "936619743392459",
          "x-requested-with": "XMLHttpRequest",
          "cookie": `csrftoken=${csrftoken}; ds_user_id=${ds_user_id}; sessionid=${sessionid};`,
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "container_module=profile&nav_chain=PolarisFeedRoot%3AfeedPage%3A3%3Atopnav-link%2CPolarisProfilePostsTabRoot%3AprofilePage%3A4%3Aunexpected%2CPolarisProfilePostsTabRoot%3AprofilePage%3A5%3Aunexpected&user_id="+id,
        "method": "POST"
      });
      


      
      try {
          const jsonResponse = JSON.parse(responseText);
      } catch (error) {
          return false
      }
      
      
    if (unfollow.ok) {
        try {
            return true  
        } catch (error) {
            return false
        }
    } else {
        return true
    }
}

async function main() {
    console.log("Fetching" + " all users...".cyan)
    const Friends = await fetch("https://www.instagram.com/api/v1/friendships/"+ds_user_id+"/following/?count="+count, {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          "priority": "u=1, i",
          "x-csrftoken": csrftoken,
          "x-ig-app-id": "936619743392459",
          "x-requested-with": "XMLHttpRequest",
          "cookie": `csrftoken=${csrftoken}; ds_user_id=${ds_user_id}; sessionid=${sessionid};`,
          "Referer": "https://www.instagram.com/ten.kartos/following/",
        },
        "body": null,
        "method": "GET"
      });

    const response = await Friends.json();  
    if (response.users) {   
        console.log("Fetched!\n".brightGreen)
        var unfollowed_count = 0
        for (const user of response.users) {  
            let isFriendly = false;

            for (const friend of friendly) {
                if (friend == user.username) {
                    isFriendly = true;
                    console.log("Skipping: " + user.username.cyan)
                    break
                }
            }
            
            if (isFriendly) continue;

            if (user.full_name == '') {
                console.log("Full Name: " + "None".cyan + " | ID: " + "@".cyan+user.username.cyan + " | ID NUMERIC: " + user.id.cyan)
            } else {
                console.log("Full Name: " + user.full_name.cyan + " | ID: " + "@".cyan+user.username.cyan + " | ID NUMERIC: " + user.id.cyan)
            }

            const spinner = cliSpinners.arc;
            let i = 0;
            let loading = setInterval(() => {
            process.stdout.write(`\r${spinner.frames[i]}`); 
            i = (i + 1) % spinner.frames.length; 
            }, spinner.interval);
            
            const status = await unfollow(user.id) 
            process.stdout.write('\r')
            clearInterval(loading); 
        
            if (status) {  
                console.log("✓".green + " User succesfully unfollowed!".white)
                unfollowed_count++
            } else {
                console.log("🗙 ".red + " There was an error in unfollowing user! Probably API Rate Limit".white)
                console.log("Exiting program!")
                process.exit(1)
            }
        } console.log("\nUnfollowed " + unfollowed_count.toString().yellow + " users!" )
    } else {  
        console.log("There was an error in fetching users!".red, response);
    }


}