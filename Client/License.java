import java.io.BufferedReader; 
import java.io.IOException; 
import java.io.InputStreamReader; 
import java.io.PrintWriter; 
import java.net.Socket; 
import java.net.UnknownHostException; 

public class License { 
	// socket object 
	private Socket socket = null; 
	private License cli;
	
	public void verify(String code) throws UnknownHostException, IOException, ClassNotFoundException { 
		cli = new License(); 
		
		// socket tcp connection 
		String ip = "192.168.2.35"; 
		int port = 6969; 
		 
		
		//System.out.println("Sending: " + code);
		code = code.replaceAll("\\-", ""); // pull out the - so we can encrypt it all together.
		
		// first prime exponent . arbitrary small value used
		code = String.valueOf(Math.pow(Integer.parseInt(code), 5));
		
		// open the connection 
		cli.socketConnect(ip, port);
		 
		 //run encryption to decide on values
		diffieHellman();
		 
		 // were the codes legit and working?
		validate(cli.echo(code), code); 
		
		// finished, close connection 
		cli.socketClose();
	} 
	
	private void diffieHellman()
	{
		// send and receive values here and determine encryption values 
		// get 3 random values for g, p, and A. g and p must be prime 
		cli.echo("7, 3, 4"); //test values 
	}
	
	private boolean validate(String returned, String code)
	{
		// double validation. Was the converted code found on server? Was our check here also validated?
		return true;
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
	
	// check if number is a prime or not
	public static boolean MillerRabin(int n)
	{
		int nMinusOne = n - 1;
		int twosMultipleCounter = 0;
		/*
			using this we can extract the 2^x value where twosMultipleCounter == x
		*/
		while (nMinusOne % 2 == 0)
		{
			nMinusOne = nMinusOne / 2;
			twosMultipleCounter++;
		}
			
		// n - 1 = 2^nMinusOne * m. Finding m here
		double m = (n - 1) / Math.pow(2, twosMultipleCounter);
		
		//Random rand = new Random();
		/* complete this testing 3 times with a new base number each time. This will
			increase likelihood of catching psuedoprimes and other cases that could
			cause us to fail. Increasing to a higher number would increase correctness
		*/
		for (int j = 0; j < 3; j++)
		{
			// The size and value of this random number matter little to the correctness. 
			// Chose 10000 to have a broad range to test with and 0 and 1 cannot work
			//double checkValue = BigInteger.ModPow(rand.Next(2, 10000), m, n); 
			/* 
				For complete correctness this would have to go to infinity and not 100.
				Miller Rabin is a probability based primality test meaning that it cannot
				say that the number is truly prime with exact correctness. Increase this
				value to increase its correctness. 
			*/
			for (int i = 0; i < 100; i++)
			{
				// We know that if this value becomes 1 we have a composite value, return false
				if (true)//checkValue == 1)
				{
					return false;
				}
				//checkValue = BigInteger.ModPow(checkValue, 2, n); 
			}
		}
		
		return true;
	}
}
