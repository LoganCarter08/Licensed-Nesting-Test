import java.io.BufferedReader; 
import java.io.IOException; 
import java.io.InputStreamReader; 
import java.io.PrintWriter; 
import java.net.Socket; 
import java.net.UnknownHostException; 
import java.util.Scanner;


public class Client { 
	// socket object 
	private Socket socket = null; 
	
	public static void main(String[] args) throws UnknownHostException, IOException, ClassNotFoundException { 
		Scanner scanner = new Scanner(System.in);
		
		// class instance 
		Client cli = new Client(); 
		
		// socket tcp connection 
		String ip = "192.168.2.35"; 
		int port = 6969; 
		 
		
		// writes and receives the message 
		//String message = "message123"; 
		System.out.println("Enter your code");
		String code = scanner.next();
		System.out.println("Sending: " + code);
		code = code.replaceAll("\\-", "");
		
		// first prime exponent 
		code = String.valueOf(Math.pow(Integer.parseInt(code), 5));
		
		
		cli.socketConnect(ip, port);
		 
		String returnStr = cli.echo(code); 
		
		// double validation. Was the converted code found on server? Was our check here also validated?
		
		
		
		cli.socketClose();
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
}
