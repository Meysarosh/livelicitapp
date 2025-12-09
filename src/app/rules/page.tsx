import { Title, SubTitle, Paragraph, Note } from '@/components/ui';

export default function RulesPage() {
  return (
    <div>
      <Title>Auction Rules &amp; How It Works</Title>

      {/* 1. Auction basics */}
      <section>
        <SubTitle>1. Auctions</SubTitle>
        <Paragraph>
          Live Licit is a real-time auction platform where registered users can list items for sale and other users can
          bid on them. Each auction is tied to a single item and has a clearly defined start and end time.
        </Paragraph>
        <ul>
          <li>
            <Paragraph>
              <strong>Who can create an auction?</strong> Only signed-in users. The creator becomes the seller of that
              auction.
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              <strong>Required data:</strong> title, description, at least one image, starting price, minimum bid
              increment, duration and (optionally) a future start time.
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              <strong>Editing:</strong> the seller can edit the auction only until the first valid bid arrives. After
              that, the auction is locked and can only be cancelled by an administrator.
            </Paragraph>
          </li>
        </ul>
        <Note>
          Statuses such as <strong>ACTIVE</strong>, <strong>FINISHED</strong> or <strong>CANCELLED</strong> help buyers
          and sellers understand where an auction is in its lifecycle.
        </Note>
      </section>

      {/* 2. Bidding */}
      <section>
        <SubTitle>2. Bidding</SubTitle>
        <Paragraph>
          Any signed-in user who is not the seller can place bids on active auctions, as long as the auction has not yet
          ended or been cancelled.
        </Paragraph>
        <ul>
          <li>
            <Paragraph>
              <strong>Minimum bid amount:</strong> each new bid must be at least the current price + the configured
              minimum increment.
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              <strong>Anti-sniping rule:</strong> if a valid bid is placed within the last 5 minutes of an auction, the
              end time is automatically extended so that at least 5 minutes remain.
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              <strong>Real-time updates:</strong> when a bid is accepted, the current price, remaining time and bid list
              are refreshed in real time for all viewers.
            </Paragraph>
          </li>
        </ul>
      </section>

      {/* 3. Deal lifecycle */}
      <section>
        <SubTitle>3. Deal Lifecycle</SubTitle>
        <Paragraph>
          When an auction ends, the highest valid bidder becomes the buyer and a <strong>Deal</strong> is created
          between buyer and seller.
        </Paragraph>
        <ul>
          <li>
            <Paragraph>
              <strong>Created:</strong> the deal is created automatically when the auction finishes with at least one
              valid bid.
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              <strong>Paid:</strong> the buyer marks the deal as paid once they have completed the payment. (The
              platform does not process payments; this is a status change for tracking.)
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              <strong>Shipped:</strong> the seller marks the deal as shipped after sending the item to the buyer’s
              shipping address.
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              <strong>Received &amp; Closed:</strong> after the buyer confirms receipt, the deal can be closed. At this
              point both parties may leave a rating about each other.
            </Paragraph>
          </li>
        </ul>
        <Note>
          The deal status makes the progress transparent for both sides and is also used for notifications and
          monitoring.
        </Note>
      </section>

      {/* 4. Messaging */}
      <section>
        <SubTitle>4. Messaging &amp; Conversations</SubTitle>
        <Paragraph>
          Buyers and sellers can communicate via conversations that are always linked to a specific auction (and its
          deal).
        </Paragraph>
        <ul>
          <li>
            <Paragraph>
              <strong>One conversation per auction and user pair:</strong> for a given auction there is at most one
              conversation between the same two users.
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              <strong>Automatic conversation creation:</strong> if there was no prior conversation, one is created
              automatically when a deal is created so system messages (payment, shipping, receipt) can be delivered.
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              <strong>System messages:</strong> the app posts system messages when the deal is paid, shipped or
              received, so both sides see a clear history of what happened.
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              <strong>Unread counters:</strong> the app tracks unread messages per user and updates counters in real
              time when new messages arrive or conversations are read.
            </Paragraph>
          </li>
        </ul>
      </section>

      {/* 5. Roles and moderation */}
      <section>
        <SubTitle>5. Roles &amp; Moderation</SubTitle>
        <Paragraph>Different roles have different capabilities in the system:</Paragraph>
        <ul>
          <li>
            <Paragraph>
              <strong>Guest:</strong> can browse public auctions and view details, but cannot bid or send messages.
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              <strong>Registered user:</strong> can create auctions, bid, participate in conversations and manage their
              own profile and shipping address.
            </Paragraph>
          </li>
          <li>
            <Paragraph>
              <strong>Admin:</strong> can moderate users and auctions (for example, suspend users or close problematic
              auctions) and can participate in support conversations if needed.
            </Paragraph>
          </li>
        </ul>
        <Note>
          Violations of the platform rules (fraud, abuse, spam, etc.) may result in administrative actions, including
          auction cancellation or account suspension.
        </Note>
      </section>

      {/* 6. Summary */}
      <section>
        <SubTitle>6. Summary</SubTitle>
        <Paragraph>
          The goal of these rules is to provide a transparent, predictable and fair environment for all participants. By
          taking part in auctions and deals on Live Licit, users agree to follow the above rules and to communicate
          clearly with their counterparties.
        </Paragraph>
      </section>
    </div>
  );
}
