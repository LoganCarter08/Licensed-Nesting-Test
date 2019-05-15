import java.io.BufferedReader; 
import java.io.IOException; 
import java.io.InputStreamReader; 
import java.io.PrintWriter; 
import java.net.Socket; 
import java.net.UnknownHostException; 
import java.util.Random;
import java.util.concurrent.TimeUnit;


public class License { 
	// socket object 
	private Socket socket = null; 
	private License cli;
	
	public void verify() throws UnknownHostException, IOException, ClassNotFoundException { 
		cli = new License(); 
		
		// socket tcp connection 
		String ip = "192.168.2.5"; 
		int port = 6969; 
		 
		 
		 /* 
			check each code for verification. setting value to 1 for testing. 
		*/
		for (int i = 0; i < 1; i++)
		{
			/*
				if the code checking failed we might be in the middle of changing a new public key
				wait half second and try again. should be enough time for server to update.
				If we failed twice then code may be incorrect
			*/
			if (!sendReceive(ip, port)) {
				try {
					TimeUnit.MILLISECONDS.sleep(500);
				} catch (InterruptedException e) {
					
				}
				sendReceive(ip, port);
			}
		}
		
		// finished, close connection 
		cli.socketClose();
	} 
	
	private boolean sendReceive(String ip, int port) throws UnknownHostException, IOException, ClassNotFoundException{
		cli.socketConnect(ip, port);
			 
		String returned = cli.echo("hello"); // get the servers public data 
		//String encoded = encode(code, customer, parsedReturned); 
		System.out.println("Recieved: " + returned);
		String encoded = encode("4587-0010-7484-4881", "test", returned); 
		System.out.println(encoded);
		cli.socketClose();
		cli.socketConnect(ip, port);
			
		String returned2 = cli.echo(encoded);
		System.out.println("Recieved2: " + returned2);
		return !returned2.equals("0");
	}

	private int gcd(int a, int b) {
		if (b != 0) {
			return gcd(b, a % b);
		}	else {
			return Math.abs(a);
		}
	}

	private int findGcdOne(int q) {
		Random random = new Random();
		int check = random.nextInt(q); // probably need low value 
		while (gcd(check, q) != 1) {
			check = random.nextInt(q);
		}
		return check;
	}

	private int expMod (int base, int exp, int mod ) {
		if (exp == 0) 
			return 1;
		if (exp % 2 == 0) {
			return (int) (Math.pow(expMod( base, (exp / 2), mod), 2) % mod);
		} else {
			return (base * expMod( base, (exp - 1), mod)) % mod;
		}
	}

	/*
		code: sent in form of xxxx xxxx xxxx xxxx 
		cust: string of customer name 
		encrpt: F h q g in string 
	*/
	private String encode (String code, String cust, String encrypt) {
		String[] array = encrypt.split("\\s+"); // find variables in the string the server sent
		int k = findGcdOne(Integer.parseInt(array[0]));//value in F where gcd(k, q) == 1
		int p = expMod(Integer.parseInt(array[3]), k, Integer.parseInt(array[2])); // g^k mod q
		int s = expMod(Integer.parseInt(array[1]), k, Integer.parseInt(array[2])); // h ^k mod q
		while (p == 1 || s == 1) {
			k = findGcdOne(Integer.parseInt(array[0]));//value in F where gcd(k, q) == 1
			p = expMod(Integer.parseInt(array[3]), k, Integer.parseInt(array[2])); // g^k mod q
			s = expMod(Integer.parseInt(array[1]), k, Integer.parseInt(array[2])); // h ^k mod q
		}
		// code = p + " " + codes * s + " " + customer in ascii * s
		return Integer.toString(p) + encodeCodes(code, s) + " " + cust; //convertToAscii(cust, s) ;
	}
	
	private String encodeCodes(String code, int s) {
		String[] codes = code.split("\\-");
		String finalCode = "";
		for (int i = 0; i < 4; i++) {
			finalCode = finalCode + " " + Integer.toString(Integer.parseInt(codes[i]) * s); // need to check and test for max int. May need to add expmod but look into how that'll effect decode
		}
		return finalCode;
	}
	
	/*
		Convert the string into ascii symbols. Converting this to an int will 
		preserve the position of each letter. Thus string concat and manip
		is needed
	*/
	private String convertToAscii(String word, int s) {
		String holder = "";
		for (int i = 0; i < word.length(); i++) {
			holder = holder + Integer.toString(((int) word.charAt(i)) * s);
		}
		return holder;
	}
	
	// make the connection with the socket 
	private void socketConnect(String ip, int port) throws UnknownHostException, IOException { 
		//System.out.println("[Connecting to socket...]"); 
		this.socket = new Socket(ip, port); 
	} 
	
	private void socketClose()
	{
		try {
			this.socket.close();
		} catch (IOException e) {
			System.out.println("couldn't close socket");
		}
	}
	
	// writes and receives the full message int the socket (String) 
	public String echo(String message) { 
		try { 
			// out & in 
			PrintWriter out = new PrintWriter(getSocket().getOutputStream(), true); 
			BufferedReader in = new BufferedReader(new InputStreamReader(getSocket().getInputStream())); 
			
			// writes str in the socket and read 
			out.println(message); 
			String returnStr = in .readLine(); 
			return returnStr; 
		} catch (IOException e) { 
			e.printStackTrace(); 
		} 
		
		return null; 
	} 
	
	// get the socket instance 
	private Socket getSocket() { 
		return socket; 
	} 
	
	private void JSONReader() {
		// create file reader 
		/*
			for each line in file 
			ignore { 
			take line, remove :"{} and turn into array 
			if first item = codes then parse that string 
			if item is cust then push that into the array, return that
			close file 
			return 
		*/
	}
}
